"use client";

import { useEffect, useRef, useState } from "react";

interface Spark { id: number; x: number; y: number; hue: string; size: number; }

/** Tiny stars that twinkle out behind the cursor. Disabled on touch / reduced-motion. */
export function SparkleCursor() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || touch) return;

    function onMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastRef.current < 45) return; // throttle
      lastRef.current = now;
      const id = idRef.current++;
      const hue = Math.random() < 0.5 ? "var(--accent)" : "var(--accent-2)";
      const spark: Spark = {
        id,
        x: e.clientX + (Math.random() * 16 - 8),
        y: e.clientY + (Math.random() * 16 - 8),
        hue,
        size: 6 + Math.random() * 8,
      };
      setSparks(prev => [...prev.slice(-22), spark]);
      setTimeout(() => setSparks(prev => prev.filter(s => s.id !== id)), 750);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none" aria-hidden>
      {sparks.map(s => (
        <svg
          key={s.id}
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          style={{
            position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)",
            animation: "sparkle-twirl 0.75s ease-out forwards",
          }}
        >
          <path
            d="M12 0c1 6 5 10 12 12-7 2-11 6-12 12-1-6-5-10-12-12 7-2 11-6 12-12z"
            fill={`rgb(${s.hue})`}
          />
        </svg>
      ))}
    </div>
  );
}
