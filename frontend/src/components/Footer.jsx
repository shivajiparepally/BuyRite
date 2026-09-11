import React from "react";
import { Link } from "react-router-dom";
import { GlassWater } from "lucide-react";

export function Footer({ categories = [], onCategory }) {
  return (
    <footer className="bg-ink text-cream mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg text-white">
            <GlassWater size={20} className="text-orange" /> North Brunswick Bottle Shop
          </div>
          <p className="text-xs text-[#C9B4AC] mt-3 leading-relaxed">
            1234 Route 27, North Brunswick, NJ 08902<br />
            (732) 555-0100<br />
            Order online — pay when you pick up.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-1.5 text-xs text-[#C9B4AC] list-none p-0 m-0">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <button onClick={() => onCategory?.(c.id)} className="hover:text-white">
                  {c.name}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => onCategory?.("deals")} className="text-orange hover:text-white">
                Deals
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-3">Customer Service</h4>
          <ul className="space-y-1.5 text-xs text-[#C9B4AC] list-none p-0 m-0">
            <li><a href="#hours" className="hover:text-white">Store Hours</a></li>
            <li><a href="tel:+17325550100" className="hover:text-white">Contact Us</a></li>
            <li><a href="#pickup" className="hover:text-white">Curbside Pickup</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-3">My Account</h4>
          <ul className="space-y-1.5 text-xs text-[#C9B4AC] list-none p-0 m-0">
            <li><Link to="/account" className="hover:text-white">Profile</Link></li>
            <li><Link to="/account" className="hover:text-white">Order History</Link></li>
            <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
            <li><Link to="/signup" className="hover:text-white">Create Account</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 text-[11px] text-[#C9B4AC] flex flex-col sm:flex-row gap-1.5 sm:justify-between">
          <span>© {new Date().getFullYear()} North Brunswick Bottle Shop. All rights reserved.</span>
          <span>You must be 21 or older to purchase. Please drink responsibly.</span>
        </div>
      </div>
    </footer>
  );
}
