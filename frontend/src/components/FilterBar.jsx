import React from "react";

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "name", label: "Name: A-Z" },
];

export function FilterBar({ sizes, selectedSizes, onToggleSize, onClearSizes, sortBy, onSortChange, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-xs text-mute font-semibold">Sort</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-ink"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {sizes.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-mute font-semibold mr-0.5">Size</span>
          {sizes.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => onToggleSize(size)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  active ? "bg-red text-white border-red" : "bg-white text-ink border-gray-300 hover:border-red"
                }`}
              >
                {size}
              </button>
            );
          })}
          {selectedSizes.length > 0 && (
            <button onClick={onClearSizes} className="text-xs text-mute underline ml-1">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
