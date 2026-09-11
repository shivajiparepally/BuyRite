import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const HERO_IMG = "https://live.staticflickr.com/8388/8647184452_0a4f0655ba_b.jpg";

export function PromoCarousel({ promos, onJump }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % promos.length), 5000);
    return () => clearInterval(t);
  }, [promos.length]);

  if (!promos.length) return null;
  const n = promos.length;
  const p = promos[Math.min(idx, n - 1)];
  const move = (d) => setIdx((i) => (i + d + n) % n);

  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white min-h-[240px] md:min-h-[300px] flex bg-red-dark"
      style={{
        backgroundImage: `linear-gradient(100deg, #5C0511 0%, rgba(92,5,17,0.92) 42%, rgba(92,5,17,0.45) 72%, rgba(92,5,17,0.15) 100%), url(${HERO_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center max-w-xl">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#F3C8BC] mb-2">Featured</span>
        <h2 className="font-display text-3xl md:text-4xl leading-tight m-0 mb-2">{p.title}</h2>
        <p className="m-0 text-[#F7DDD5] text-sm md:text-base">{p.subtitle}</p>
        <button
          onClick={() => onJump(p.category)}
          className="mt-6 inline-flex items-center gap-2 self-start bg-white text-red font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-cream transition"
        >
          Shop now <ArrowRight size={16} />
        </button>
      </div>

      {n > 1 && (
        <>
          <button
            onClick={() => move(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => move(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-8 md:left-12 flex gap-1.5">
            {promos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className="h-1.5 rounded transition-all"
                style={{
                  width: i === idx ? 22 : 7,
                  background: i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
