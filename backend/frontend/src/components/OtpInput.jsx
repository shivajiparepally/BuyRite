import React, { useRef } from "react";

/**
 * Six single-character boxes. `value` is the joined string; `onChange` gets
 * the new string. Auto-advances, supports backspace and paste.
 */
export function OtpInput({ value = "", onChange, autoFocus = true }) {
  const refs = useRef([]);
  const chars = value.padEnd(6).slice(0, 6).split("");

  const setChar = (i, c) => {
    const next = chars.map((x, idx) => (idx === i ? c : x)).join("").replace(/\s/g, "");
    onChange(next);
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setChar(i, digit);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[i].trim()) {
        setChar(i, " ");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setChar(i - 1, " ");
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits) {
      onChange(digits);
      refs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          value={c.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 py-3 text-center text-lg font-semibold rounded-lg border border-gray-300 text-ink focus:border-red focus:outline-none"
        />
      ))}
    </div>
  );
}
