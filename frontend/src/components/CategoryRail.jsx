import React from "react";

export function CategoryRail({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto py-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap shrink-0 ${
          active === null ? "bg-red text-white border-red" : "bg-white text-ink border-cream"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap shrink-0 ${
            active === c.id ? "bg-red text-white border-red" : "bg-white text-ink border-cream"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
