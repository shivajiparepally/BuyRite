import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { GlassWater } from "lucide-react";

const KEY = "age_verified";

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function write(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* private mode / storage disabled — gate just re-asks next load */
  }
}

export function AgeGate({ children }) {
  const { pathname } = useLocation();
  const [answer, setAnswer] = useState(read);

  // Admin area is a separate entrance — never gate it.
  if (pathname.startsWith("/admin")) return children;

  if (answer === "yes") return children;

  if (answer === "no") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-dark px-5 text-center">
        <div className="max-w-sm w-full text-white">
          <h1 className="font-display text-2xl mb-3">Sorry — you must be 21 or older</h1>
          <p className="text-sm text-[#E8B4A8] mb-6">
            You are not eligible to purchase alcohol from this store.
          </p>
          <button
            onClick={() => {
              write("");
              setAnswer("");
            }}
            className="text-white underline text-sm"
          >
            Change my answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-dark px-5 text-center">
      <div className="max-w-sm w-full text-white">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-orange flex items-center justify-center">
          <GlassWater color="#fff" size={28} />
        </div>
        <h1 className="font-display text-2xl mb-2">Are you 21 or older?</h1>
        <p className="text-xs text-[#E8B4A8] mb-6">
          You must be of legal drinking age to enter this site.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              write("yes");
              setAnswer("yes");
            }}
            className="flex-1 py-3 rounded-lg bg-orange font-semibold"
          >
            Yes, I am 21+
          </button>
          <button
            onClick={() => {
              write("no");
              setAnswer("no");
            }}
            className="flex-1 py-3 rounded-lg border border-white/40 font-semibold"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
