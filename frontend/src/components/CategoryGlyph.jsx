import React from "react";
import { Wine, Beer, GlassWater, Martini, Sparkles, FlaskConical } from "lucide-react";

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

const TINTS = ["#B3122A", "#EE7203"];

export function CategoryGlyph({ slug, index = 0, size = 44 }) {
  const Icon = ICONS[slug] || GlassWater;
  const tint = TINTS[index % 2];
  return (
    <div
      style={{ width: size, height: size, background: tint }}
      className="rounded-full flex items-center justify-center shrink-0"
    >
      <Icon color="#fff" size={Math.round(size * 0.5)} strokeWidth={2} />
    </div>
  );
}
