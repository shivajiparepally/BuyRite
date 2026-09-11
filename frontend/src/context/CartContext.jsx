import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // items: { cartId, variantId, name, size, price, salePrice, qty, subChoice }

  const addItem = (variant, product, subChoice) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id && i.subChoice === subChoice);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          cartId: `${variant.id}-${subChoice || "none"}-${Date.now()}`,
          variantId: variant.id,
          name: product.name,
          size: variant.size,
          price: Number(variant.price),
          salePrice: variant.sale_price ? Number(variant.sale_price) : null,
          qty: 1,
          subChoice: subChoice || null,
        },
      ];
    });
  };

  const changeQty = (cartId, delta) =>
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));

  const removeItem = (cartId) => setItems((prev) => prev.filter((i) => i.cartId !== cartId));

  // The plain (no-substitution) cart line for a variant, or undefined.
  // Used by the product card's "– qty +" stepper.
  const itemForVariant = (variantId) =>
    items.find((i) => i.variantId === variantId && !i.subChoice);

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, removeItem, itemForVariant, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
