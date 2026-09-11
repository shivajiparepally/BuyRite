import React from "react";

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export function PriceTag({ price, salePrice }) {
  if (salePrice) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="line-through text-mute text-sm">{fmt(price)}</span>
        <span className="font-display font-bold text-xl text-red">{fmt(salePrice)}</span>
      </div>
    );
  }
  return <span className="font-display font-bold text-xl text-ink">{fmt(price)}</span>;
}
