import React, { useState } from "react";
import { PackageX } from "lucide-react";

export function SubstitutionModal({ product, onCancel, onConfirm }) {
  const [choice, setChoice] = useState("substitute");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex gap-2.5 items-center mb-1.5">
          <PackageX className="text-red" size={22} />
          <h3 className="font-display text-lg text-ink m-0">{product.name} is out of stock</h3>
        </div>
        <p className="text-mute text-sm mb-4">Choose how you'd like this item handled:</p>
        {[
          ["substitute", "Store picks a similar substitute"],
          ["call", "Call me before substituting"],
        ].map(([val, label]) => (
          <label
            key={val}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border mb-2 cursor-pointer ${
              choice === val ? "border-red" : "border-gray-200"
            }`}
          >
            <input type="radio" checked={choice === val} onChange={() => setChoice(val)} />
            <span className="text-sm">{label}</span>
          </label>
        ))}
        <div className="flex gap-2.5 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-300 bg-white">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(choice)}
            className="flex-1 py-2.5 rounded-lg bg-red text-white font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
