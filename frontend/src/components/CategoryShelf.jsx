import React from "react";
import { Wine, Beer, GlassWater, Martini, Sparkles, FlaskConical, LayoutGrid, Percent } from "lucide-react";

const ICONS = {
  whiskey: GlassWater, "whiskey-bourbon": GlassWater,
  vodka: Martini,
  rum: FlaskConical,
  tequila: FlaskConical,
  gin: Martini,
  wine: Wine,
  beer: Beer,
  champagne: Sparkles, "champagne-sparkling": Sparkles,
  cognac: GlassWater, "cognac-brandy": GlassWater,
  liqueurs: Martini, "liqueurs-cordials": Martini,
};

const TINTS = ["#B3122A", "#7a3b1e", "#8f4a22", "#5C0511"];

/**
 * A dark "shelf" styled department nav — each category sits like a bottle on
 * a shelf (icon + label), lifting and glowing on hover, replacing the plain
 * pill-button nav bar.
 */
export function CategoryShelf({ categories, active, onSelect }) {
  const Item = ({ slug, tint, Icon, label, value }) => {
    const isActive = active === value;
    return (
      <button
        onClick={() => onSelect(value)}
        className="group flex flex-col items-center shrink-0 px-3 pt-2 pb-2.5 transition-transform duration-200 hover:-translate-y-1.5"
        style={{ transform: isActive ? undefined : undefined }}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shadow-md transition-all duration-200 ${
            isActive ? "ring-2 ring-orange ring-offset-2 ring-offset-[#2a1810] scale-110" : "group-hover:scale-110 group-hover:rotate-[-4deg]"
          }`}
          style={{
            background: tint,
            boxShadow: isActive
              ? "0 0 16px rgba(238,114,3,0.7)"
              : undefined,
          }}
        >
          <Icon color="#fff" size={18} strokeWidth={2} />
        </div>
        <span
          className={`text-[11px] whitespace-nowrap transition-colors ${
            isActive ? "text-orange font-bold" : "text-[#E8DCD3] group-hover:text-white"
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="relative" style={{ background: "linear-gradient(180deg, #3a2418 0%, #2a1810 100%)" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-end gap-0.5 overflow-x-auto">
        <Item slug="all" tint="#6b4a30" Icon={LayoutGrid} label="All Products" value={null} />
        {categories.map((c, i) => (
          <Item
            key={c.id}
            Icon={ICONS[c.slug] || GlassWater}
            tint={TINTS[i % TINTS.length]}
            label={c.name}
            value={c.id}
          />
        ))}
        <Item slug="deals" tint="#EE7203" Icon={Percent} label="Deals" value="deals" />
      </div>
      {/* the shelf's own edge/ledge */}
      <div className="h-[6px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
    </div>
  );
}
