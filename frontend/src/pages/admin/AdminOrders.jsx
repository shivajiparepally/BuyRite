import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import client from "../../api/client";
import { OrderItemsList } from "../../components/admin/OrderItemsList";
import { STATUS_FLOW, STATUS_LABEL } from "../../components/admin/orderStatus";

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
  const navigate = useNavigate();
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
              <button
                onClick={() => navigate(`/admin/users/${o.customer}`)}
                className="font-semibold text-ink hover:text-red hover:underline"
              >
                {o.customer_username}
              </button>
              <span className="text-mute text-[11px] ml-2">Order #{o.id}</span>
              <span className="text-mute text-xs ml-2.5">{new Date(o.created_at).toLocaleString()}</span>
              <div className="text-xs mt-1">
                {o.customer_phone ? (
                  <a href={`tel:${o.customer_phone}`} className="text-red font-semibold">
                    📞 {o.customer_phone}
                  </a>
                ) : (
                  <span className="text-mute">no phone on file</span>
                )}
              </div>
            </div>
            <span className={`text-xs font-bold ${o.status === "cancelled" ? "text-red" : "text-orange"}`}>
              {STATUS_LABEL[o.status]}
            </span>
          </div>
          <OrderItemsList order={o} />
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
