import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CategoryGlyph } from "./CategoryGlyph";
import { PriceTag } from "./PriceTag";
import { SubstitutionModal } from "./SubstitutionModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export function ProductCard({ product, categoryIndex, onRequireAuth }) {
  const { addItem, changeQty, removeItem, itemForVariant } = useCart();
  const { user } = useAuth();
  const [showSub, setShowSub] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const variant = product.variants?.[0];
  if (!variant) return null;
  const outOfStock = !variant.in_stock;

  const line = itemForVariant(variant.id);
  const qty = line?.qty ?? 0;
  const slug = product.category_name?.toLowerCase().replace(/[^a-z]+/g, "-");
  const save = variant.sale_price ? Number(variant.price) - Number(variant.sale_price) : 0;

  const doAdd = () => addItem(variant, product, null);
  const handleAdd = () => {
    if (outOfStock) return setShowSub(true);
    if (!user) return onRequireAuth?.(doAdd);
    doAdd();
  };
  const inc = () => (line ? changeQty(line.cartId, 1) : handleAdd());
  const dec = () => {
    if (!line) return;
    qty <= 1 ? removeItem(line.cartId) : changeQty(line.cartId, -1);
  };

  return (
    <div className="group bg-white border border-cream rounded-xl overflow-hidden flex flex-col transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-[4/5] bg-cream/40 flex items-center justify-center overflow-hidden border-b border-cream">
        {product.image_url && !imgFailed ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
              outOfStock ? "grayscale opacity-70" : ""
            }`}
          />
        ) : (
          <CategoryGlyph slug={slug} index={categoryIndex} size={76} />
        )}

        {save > 0 && !outOfStock && (
          <span className="absolute top-2 left-2 bg-orange text-white text-[11px] font-bold px-2 py-1 rounded">
            SAVE ${save.toFixed(2)}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-2 left-2 bg-cream text-red text-[11px] font-bold px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <span className="text-[10px] uppercase tracking-wider text-mute">{product.category_name}</span>
        <h4 className="font-display font-semibold text-ink text-[15px] leading-snug line-clamp-2 min-h-[2.6em] m-0">
          {product.name}
        </h4>
        <span className="text-xs text-mute">{variant.size} · SKU {variant.sku}</span>
        {product.description && (
          <p className="text-xs text-mute leading-relaxed line-clamp-2 m-0 mt-0.5">{product.description}</p>
        )}

        <div className="mt-auto pt-2.5">
          <PriceTag price={variant.price} salePrice={variant.sale_price} />
          <div className="mt-2">
            {!outOfStock && qty > 0 ? (
              <div className="flex items-center justify-between bg-red text-white rounded-lg px-2 py-1.5">
                <button onClick={dec} aria-label="Decrease quantity" className="w-8 h-7 flex items-center justify-center">
                  <Minus size={15} />
                </button>
                <span className="text-sm font-semibold tabular-nums">{qty} in cart</span>
                <button onClick={inc} aria-label="Increase quantity" className="w-8 h-7 flex items-center justify-center">
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                  outOfStock ? "bg-cream text-red hover:bg-cream/70" : "bg-red text-white hover:bg-red-dark"
                }`}
              >
                {outOfStock ? "Request Substitute" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showSub && (
        <SubstitutionModal
          product={product}
          onCancel={() => setShowSub(false)}
          onConfirm={(choice) => {
            addItem(variant, product, choice);
            setShowSub(false);
          }}
        />
      )}
    </div>
  );
}
