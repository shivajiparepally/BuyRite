import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import client from "../../api/client";
import { OrderItemsList } from "../../components/admin/OrderItemsList";
import { STATUS_LABEL } from "../../components/admin/orderStatus";

export default function AdminUserOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(null);
    setOrders(null);
    setError(null);
    Promise.all([
      client.get("/auth/users/", { params: { page_size: 500 } }),
      client.get("/orders/", { params: { customer: id } }),
    ])
      .then(([usersRes, ordersRes]) => {
        const list = usersRes.data.results ?? usersRes.data;
        const found = list.find((u) => String(u.id) === String(id));
        if (!found) {
          setError("That customer couldn't be found.");
          return;
        }
        setUser(found);
        setOrders(
          (ordersRes.data.results ?? ordersRes.data).slice().sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        );
      })
      .catch(() => setError("Couldn't load this customer's orders."));
  }, [id]);

  const current = orders?.filter((o) => !o.is_archived && o.status !== "completed" && o.status !== "cancelled") ?? [];
  const past = orders?.filter((o) => o.is_archived || o.status === "completed" || o.status === "cancelled") ?? [];

  return (
    <div>
      <button onClick={() => navigate("/admin/users")} className="flex items-center gap-1.5 text-sm text-mute mb-3.5">
        <ArrowLeft size={15} /> Back to Customers
      </button>

      {error && <p className="text-red text-sm">{error}</p>}
      {!error && !user && <p className="text-mute text-sm">Loading…</p>}

      {user && (
        <>
          <div className="bg-cream rounded-lg p-4 mb-5">
            <h3 className="font-display m-0 mb-1">{user.username}</h3>
            <div className="text-sm text-ink">{[user.first_name, user.last_name].filter(Boolean).join(" ")}</div>
            <div className="text-xs text-mute mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              <span>{user.email || "no email on file"}</span>
              {user.phone_number ? (
                <a href={`tel:${user.phone_number}`} className="text-red font-semibold">📞 {user.phone_number}</a>
              ) : (
                <span>no phone on file</span>
              )}
              <span>Joined {new Date(user.date_joined).toLocaleDateString()}</span>
            </div>
          </div>

          <h4 className="font-display text-base mb-2.5">Current orders ({current.length})</h4>
          {current.length === 0 && <p className="text-mute text-sm mb-4">No active orders.</p>}
          {current.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}

          <h4 className="font-display text-base mb-2.5 mt-6">Past orders ({past.length})</h4>
          {past.length === 0 && <p className="text-mute text-sm">No past orders.</p>}
          {past.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="border border-cream rounded-lg p-3.5 mb-2.5">
      <div className="flex justify-between mb-2">
        <div>
          <span className="text-mute text-xs">Order #{order.id}</span>
          <span className="text-mute text-xs ml-2.5">{new Date(order.created_at).toLocaleString()}</span>
        </div>
        <span className={`text-xs font-bold ${order.status === "cancelled" ? "text-red" : "text-orange"}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      <OrderItemsList order={order} />
    </div>
  );
}
