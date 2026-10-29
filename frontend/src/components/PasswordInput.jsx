import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Drop-in replacement for <input type="password">, with a show/hide toggle.
 * Accepts the same props (value, onChange, className, etc.) as a plain input.
 */
export function PasswordInput({ className = "", ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} className={`${className} pr-10`} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
