import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, LogOut, User, MapPin, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ConfirmModal } from "./ConfirmModal";

function todayHoursLabel(hours) {
  if (!hours?.length) return null;
  const t = hours.find((h) => h.day_of_week === new Date().getDay());
  if (!t) return null;
  if (t.is_closed) return "Closed today";
  const hhmm = (x) => (x || "").slice(0, 5);
  return `Open today ${hhmm(t.open_time)}–${hhmm(t.close_time)}`;
}

export function Header({
  products,
  search,
  setSearch,
  onCartClick,
  categories = [],
  activeCategory,
  setActiveCategory,
  hours = [],
}) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const suggestions = useMemo(() => {
    if (!search || !products) return [];
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
  }, [search, products]);

  const hoursLabel = todayHoursLabel(hours);

  const doLogout = () => {
    setConfirmLogout(false);
    logout();
    navigate("/");
  };

  const navItem = (key, label, opts = {}) => {
    const active = activeCategory === key;
    return (
      <button
        key={key ?? "all"}
        onClick={() => setActiveCategory?.(key)}
        className={`whitespace-nowrap px-1 py-3 text-sm border-b-2 transition ${
          active
            ? "border-red text-red font-semibold"
            : `border-transparent ${opts.accent ? "text-orange" : "text-ink"} hover:text-red`
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <header>
      {/* utility strip */}
      <div className="bg-ink text-cream text-xs">
        <div className="max-w-6xl mx-auto px-6 h-8 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} /> North Brunswick, NJ · Pay at pickup
          </span>
          <span className="hidden sm:flex items-center gap-3">
            {hoursLabel && <span>{hoursLabel}</span>}
            <span className="text-[#E8B4A8]">Must be 21+</span>
          </span>
        </div>
      </div>

      {/* main bar */}
      <div className="bg-red-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-5">
          <Link to="/" className="flex items-center shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Buy Rite Renaissance Spirits" className="h-12 w-auto rounded-md" />
          </Link>

          <div className="flex-1 relative">
            <div className="flex items-center bg-white rounded-full pl-4 pr-1 py-1">
              <Search size={16} className="text-mute" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search wine, spirits, beer..."
                className="border-none outline-none ml-2 flex-1 text-sm text-ink bg-transparent"
              />
              <button className="bg-red text-white text-sm font-semibold rounded-full px-4 py-1.5 hidden sm:block">
                Search
              </button>
            </div>
            {focused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg z-20 overflow-hidden mt-1">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    onMouseDown={() => setSearch(s.name)}
                    className="px-3.5 py-2 text-sm text-ink cursor-pointer border-b border-cream hover:bg-cream"
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {user.is_staff && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-1.5 border border-white/40 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap"
                >
                  <Settings size={14} /> <span className="hidden md:inline">Admin</span>
                </button>
              )}
              <Link to="/account" className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                <User size={15} /> {user.first_name || user.username}
              </Link>
              <button onClick={() => setConfirmLogout(true)} className="flex items-center gap-1.5 text-sm">
                <LogOut size={15} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm whitespace-nowrap">Log in</Link>
          )}

          <button
            onClick={onCartClick}
            className="flex items-center gap-2 bg-orange rounded-full px-4 py-2 text-sm font-semibold"
          >
            <ShoppingCart size={15} /> {count}
          </button>
        </div>
      </div>

      {/* department nav */}
      {setActiveCategory && (
        <nav className="bg-white border-b border-cream">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-5 overflow-x-auto">
            {navItem(null, "All Products")}
            {categories.map((c) => navItem(c.id, c.name))}
            {navItem("deals", "Deals", { accent: true })}
          </div>
        </nav>
      )}

      <ConfirmModal
        open={confirmLogout}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, log out"
        cancelLabel="No"
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  );
}
