import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/auth/users/", { params: { page_size: 500 } })
      .then((r) => setUsers(r.data.results ?? r.data))
      .catch(() => setError("Couldn't load users."));
  }, []);

  return (
    <div>
      <h3 className="font-display m-0 mb-3.5">Customers {users ? `(${users.length})` : ""}</h3>

      {error && <p className="text-red text-sm">{error}</p>}
      {!error && users === null && <p className="text-mute text-sm">Loading…</p>}
      {users?.length === 0 && <p className="text-mute text-sm">No customers yet.</p>}

      {users?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-mute border-b border-gray-200">
                <th className="py-2 px-2.5">Username</th>
                <th className="py-2 px-2.5">Name</th>
                <th className="py-2 px-2.5">Email</th>
                <th className="py-2 px-2.5">Phone</th>
                <th className="py-2 px-2.5">Joined</th>
                <th className="py-2 px-2.5">Email verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-cream">
                  <td className="py-2 px-2.5">
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="text-red font-semibold hover:underline"
                    >
                      {u.username}
                    </button>
                  </td>
                  <td className="py-2 px-2.5">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="py-2 px-2.5">{u.email || "—"}</td>
                  <td className="py-2 px-2.5">{u.phone_number || "—"}</td>
                  <td className="py-2 px-2.5 text-mute">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="py-2 px-2.5">
                    {u.email_verified ? (
                      <span className="text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Verified</span>
                    ) : (
                      <span className="text-[11px] text-orange bg-cream px-2 py-0.5 rounded-full">Unverified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
