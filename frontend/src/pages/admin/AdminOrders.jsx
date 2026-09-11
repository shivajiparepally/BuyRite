import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import client from "../../api/client";

const STATUS_FLOW = ["new", "preparing", "ready", "completed"];
const STATUS_LABEL = { new: "New", preparing: "Preparing", ready: "Ready", completed: "Completed", cancelled: "Cancelled" };

function useBeep() {
  const ctxRef = useRef(null);
  return () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch (e) { /* ignore */ }
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [banner, setBanner] = useState(null);
  const knownIds = useRef(new Set());
  const beep = useBeep();

  const load = async () => {
    const { data } = await client.get("/orders/");
    const list = data.results ?? data;
    // detect brand-new orders for the sound + visual alert
    const newOnes = list.filter((o) => o.status === "new" && !knownIds.current.has(o.id));
    if (knownIds.current.size > 0 && newOnes.length > 0) {
      beep();
      setBanner(`${newOnes.length} new order${newOnes.length > 1 ? "s" : ""} just came in!`);
      setTimeout(() => setBanner(null), 5000);
    }
    list.forEach((o) => knownIds.current.add(o.id));
    setOrders(list);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // poll for new orders
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = orders
    .filter((o) => (showArchived ? o.is_archived : !o.is_archived))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const setStatus = async (id, status) => {
    await client.patch(`/orders/${id}/set_status/`, { status });
    load();
  };
  const archive = async (id) => { await client.post(`/orders/${id}/archive/`); load(); };
  const restore = async (id) => { await client.post(`/orders/${id}/restore/`); load(); };
  const cancel = async (id) => { await client.post(`/orders/${id}/cancel/`); load(); };

  return (
    <div>
      {banner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-red text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg">
          <Bell size={16} /> <span className="text-sm">{banner}</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-3.5">
        <h3 className="font-display m-0">{showArchived ? "Archived Orders" : "Order Queue"} ({visible.length})</h3>
        <button onClick={() => setShowArchived((s) => !s)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white">
          {showArchived ? "Show Active" : "Show Archived"}
        </button>
      </div>
      {visible.length === 0 && <p className="text-mute text-sm">No orders here.</p>}
      {visible.map((o) => (
        <div key={o.id} className="border border-cream rounded-lg p-3.5 mb-2.5">
          <div className="flex justify-between mb-2">
            <div>
              <strong>Order #{o.id}</strong>
              <span className="text-mute text-xs ml-2.5">{new Date(o.created_at).toLocaleString()}</span>
              <div className="text-xs mt-1">
                <span className="text-ink">{o.customer_username}</span>
                {o.customer_phone ? (
                  <a href={`tel:${o.customer_phone}`} className="ml-2 text-red font-semibold">
                    📞 {o.customer_phone}
                  </a>
                ) : (
                  <span className="ml-2 text-mute">no phone on file</span>
                )}
              </div>
            </div>
            <span className={`text-xs font-bold ${o.status === "cancelled" ? "text-red" : "text-orange"}`}>
              {STATUS_LABEL[o.status]}
            </span>
          </div>
          <ul className="list-none pl-0 my-2 border-y border-cream divide-y divide-cream">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between py-1.5 text-xs">
                <span className="text-ink">
                  {i.quantity}× {i.product_name}
                  <span className="text-mute"> · {i.size}</span>
                  {i.substitution_choice && (
                    <span className="text-orange">
                      {" "}· {i.substitution_choice === "substitute" ? "may substitute" : "call before substituting"}
                    </span>
                  )}
                </span>
                <span className="text-mute whitespace-nowrap ml-3">${Number(i.line_total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs text-mute mb-2">
            Pickup {o.schedule} · <span className="text-ink font-semibold">total ${Number(o.total).toFixed(2)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!showArchived && STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(o.id, s)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs ${o.status === s ? "border-red text-red" : "border-gray-300 text-ink"}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
            {!showArchived && (
              <button onClick={() => cancel(o.id)} className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs">Cancel</button>
            )}
            {!showArchived ? (
              <button onClick={() => archive(o.id)} className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs">Archive</button>
            ) : (
              <button onClick={() => restore(o.id)} className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs">Undo (Restore)</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
