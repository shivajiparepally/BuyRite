import React, { useEffect } from "react";
import { playCheers } from "../utils/sounds";

const ICONS = ["🍾", "🥂", "🍻", "🥃", "🍷"];

/** A brief celebratory overlay + "cheers" sound shown right after an order is placed. */
export function OrderCelebration({ message, onDone }) {
  useEffect(() => {
    playCheers();
    const t = setTimeout(() => onDone?.(), 3600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none px-5">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 0.5;
          const duration = 1.8 + Math.random() * 1.2;
          const size = 20 + Math.random() * 20;
          return (
            <span
              key={i}
              className="absolute bottom-0 select-none"
              style={{
                left: `${left}%`,
                fontSize: size,
                animation: `celebrate-rise ${duration}s ease-out ${delay}s forwards`,
                opacity: 0,
              }}
            >
              {ICONS[i % ICONS.length]}
            </span>
          );
        })}
      </div>

      <div
        className="relative bg-red-dark text-white rounded-2xl px-7 py-6 text-center shadow-2xl"
        style={{ animation: "celebrate-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div className="text-4xl mb-2">🥂</div>
        <h3 className="font-display text-xl m-0 mb-1">Cheers! Order placed</h3>
        <p className="text-sm text-[#F3C8BC] m-0">{message}</p>
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
