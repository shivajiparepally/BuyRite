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
 * An illustrated "shelf" department nav — each category sits like a bottle
 * on a shelf (icon + label), lifting and glowing on hover. Even-width,
 * wrapping labels so every item lines up regardless of name length.
 */
export function CategoryShelf({ categories, active, onSelect }) {
  const Item = ({ tint, Icon, label, value }) => {
    const isActive = active === value;
    return (
      <button
        onClick={() => onSelect(value)}
        className="group flex flex-col items-center shrink-0 w-[76px] px-1 pt-2.5 pb-2.5 transition-transform duration-200 hover:-translate-y-1.5"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shadow-md transition-all duration-200 ${
            isActive ? "ring-2 ring-red ring-offset-2 ring-offset-[#FFE9A8] scale-110" : "group-hover:scale-110 group-hover:rotate-[-4deg]"
          }`}
          style={{
            background: tint,
            boxShadow: isActive ? "0 0 14px rgba(179,18,42,0.55)" : undefined,
          }}
        >
          <Icon color="#fff" size={18} strokeWidth={2} />
        </div>
        <span
          className={`text-[10.5px] leading-[1.15] text-center transition-colors ${
            isActive ? "text-red font-bold" : "text-ink/80 group-hover:text-red"
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="relative" style={{ background: "linear-gradient(180deg, #FFFBF0 0%, #FFE9A8 100%)" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-start gap-1 overflow-x-auto">
        <Item tint="#6b4a30" Icon={LayoutGrid} label="All Products" value={null} />
        {categories.map((c, i) => (
          <Item
            key={c.id}
            Icon={ICONS[c.slug] || GlassWater}
            tint={TINTS[i % TINTS.length]}
            label={c.name}
            value={c.id}
          />
        ))}
        <Item tint="#EE7203" Icon={Percent} label="Deals" value="deals" />
      </div>
      {/* the shelf's own edge/ledge */}
      <div className="h-[5px]" style={{ background: "linear-gradient(180deg, rgba(120,90,30,0.25), rgba(0,0,0,0))" }} />
    </div>
  );
}
