import React, { useEffect, useState } from "react";
import { playBagClink, playGroupCheers } from "../utils/sounds";

const BAG_ICONS = ["🛍️", "🍾", "🍺", "🍷"];
const CHEERS_ICONS = ["🥂", "🍻", "✨", "🎉"];

function EmojiBurst({ icons, keySeed }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 14 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 1.1;
        const size = 20 + Math.random() * 18;
        return (
          <span
            key={`${keySeed}-${i}`}
            className="absolute bottom-0 select-none"
            style={{
              left: `${left}%`,
              fontSize: size,
              animation: `celebrate-rise ${duration}s ease-out ${delay}s forwards`,
              opacity: 0,
            }}
          >
            {icons[i % icons.length]}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Shown right after an order is placed. Plays a "bag of bottles" clink on
 * mount, then WAITS — it never auto-dismisses. A "Click me to cheers" button
 * plays a fuller group-toast sound (doesn't leave the page). Only the
 * explicit "back to home" link closes it.
 */
export function OrderCelebration({ message, onDone }) {
  const [cheered, setCheered] = useState(false);

  // play the "carrying a bag of bottles" sound once, right as this mounts
  useEffect(() => {
    playBagClink();
  }, []);

  const handleCheers = () => {
    setCheered(true);
    playGroupCheers();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/55" />

      <EmojiBurst icons={BAG_ICONS} keySeed="bag" />
      {cheered && <EmojiBurst icons={CHEERS_ICONS} keySeed="cheers" />}

      <div
        className="relative bg-red-dark text-white rounded-2xl px-7 py-6 text-center shadow-2xl max-w-sm w-full"
        style={{ animation: "celebrate-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div className="text-4xl mb-2">🛍️🍾</div>
        <h3 className="font-display text-xl m-0 mb-1">Order placed!</h3>
        <p className="text-sm text-[#F3C8BC] m-0 mb-5">{message}</p>

        {!cheered ? (
          <button
            onClick={handleCheers}
            className="w-full py-3 rounded-lg bg-orange text-white font-semibold hover:bg-orange/90 transition"
          >
            Click me to cheers 🥂
          </button>
        ) : (
          <div className="py-1">
            <div className="text-3xl mb-1">🥂🎉</div>
            <p className="text-sm text-[#F3C8BC] m-0">Cheers — enjoy!</p>
          </div>
        )}

        <button onClick={onDone} className="mt-5 text-xs text-[#E8B4A8] underline hover:text-white">
          ← Back to home
        </button>
      </div>

      <style>{`
        @keyframes celebrate-rise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-70vh) rotate(25deg); opacity: 0; }
        }
        @keyframes celebrate-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
