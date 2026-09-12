import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/promotions", label: "Promotions" },
  { to: "/admin/hours", label: "Store Hours" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fdf7f6]">
      <div className="bg-red-dark text-white px-6 py-4 flex items-center gap-3.5">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 bg-transparent border-none text-white">
          <ArrowLeft size={17} /> Back to Store
        </button>
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Buy Rite Renaissance Spirits" className="h-8 w-auto rounded ml-2.5" />
        <h2 className="font-display m-0 ml-2.5 text-xl">Admin Dashboard</h2>
      </div>
      <div className="flex gap-1.5 px-6 pt-4">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-t-lg text-sm font-semibold ${isActive ? "bg-white text-red" : "text-mute"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <div className="bg-white mx-6 mb-6 rounded-b-xl rounded-tr-xl p-5 min-h-[420px]">
        <Outlet />
      </div>
    </div>
  );
}
