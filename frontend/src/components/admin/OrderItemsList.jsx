import React from "react";

/** The items + pickup/total block shared by the order queue and a customer's order history. */
export function OrderItemsList({ order }) {
  return (
    <>
      <ul className="list-none pl-0 my-2 border-y border-cream divide-y divide-cream">
        {order.items.map((i) => (
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
        Pickup {order.schedule} · <span className="text-ink font-semibold">total ${Number(order.total).toFixed(2)}</span>
      </div>
    </>
  );
}
