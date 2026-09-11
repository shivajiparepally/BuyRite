import React, { useState } from "react";
import { X, Plus, Minus, Trash2, Clock } from "lucide-react";
import { useCart } from "../context/CartContext";

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function isOpenNow(hours) {
  if (!hours || !hours.length) return true; // fail open if hours haven't loaded
  const now = new Date();
  const today = hours.find((h) => h.day_of_week === now.getDay());
  if (!today || today.is_closed) return false;
  const [oh, om] = today.open_time.split(":").map(Number);
  const [ch, cm] = today.close_time.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

export function CartDrawer({ onClose, hours, onSubmit, submitting }) {
  const { items, changeQty, removeItem, total } = useCart();
  const openNow = isOpenNow(hours);
  const [schedule, setSchedule] = useState(openNow ? "today" : "tomorrow");
  const today = hours?.find((h) => h.day_of_week === new Date().getDay());

  return (
    <div className="fixed inset-0 z-40">
      <div onClick={onClose} className="absolute inset-0 bg-black/45" />
      <div className="absolute right-0 top-0 bottom-0 w-96 max-w-[92vw] bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-cream flex justify-between items-center">
          <h3 className="font-display text-xl m-0">Your Cart</h3>
          <button onClick={onClose}><X size={20} className="text-ink" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 && <p className="text-mute text-sm text-center mt-8">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.cartId} className="flex gap-2.5 py-3 border-b border-cream">
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{item.name}</div>
                <div className="text-[11px] text-mute">
                  {item.size}
                  {item.subChoice ? ` · ${item.subChoice === "substitute" ? "OK to substitute" : "Call before substituting"}` : ""}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={() => changeQty(item.cartId, -1)} className="w-5.5 h-5.5 rounded-full border border-gray-300 flex items-center justify-center"><Minus size={12} /></button>
                  <span className="text-xs w-4 text-center">{item.qty}</span>
                  <button onClick={() => changeQty(item.cartId, 1)} className="w-5.5 h-5.5 rounded-full border border-gray-300 flex items-center justify-center"><Plus size={12} /></button>
                  <button onClick={() => removeItem(item.cartId)} className="ml-auto"><Trash2 size={14} className="text-mute" /></button>
                </div>
              </div>
              <div className="text-sm font-semibold text-ink">{fmt((item.salePrice ?? item.price) * item.qty)}</div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream p-5">
            <div className="flex items-center gap-2 bg-cream rounded-lg px-3 py-2.5 text-xs text-red mb-3">
              <Clock size={15} />
              {today
                ? openNow
                  ? `Open today until ${today.close_time} — ready for pickup today.`
                  : `Store is closed right now (hours: ${today.open_time}–${today.close_time}).`
                : "Loading store hours..."}
            </div>
            {!openNow && (
              <div className="mb-3">
                <label className="text-xs text-mute">Pickup</label>
                <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-gray-300 mt-1">
                  <option value="tomorrow">Schedule for tomorrow</option>
                </select>
              </div>
            )}
            <div className="flex justify-between text-base font-bold mb-3.5">
              <span>Total (pay at pickup)</span><span>{fmt(total)}</span>
            </div>
            <button
              onClick={() => onSubmit(schedule)}
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-red text-white font-bold text-sm disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Order — Pay at Pickup"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
