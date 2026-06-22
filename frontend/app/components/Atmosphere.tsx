"use client";

import { useEffect, useState } from "react";

interface Star { id: number; x: number; y: number; size: number; delay: number; dur: number; }
interface Petal { id: number; x: number; delay: number; dur: number; size: number; sway: number; kind: number; }

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

/** Ambient anime sky: twinkling stars + drifting sakura petals + a soft moon.
 *  Generated client-side after mount to avoid hydration mismatch. */
export function Atmosphere() {
  const [stars, setStars] = useState<Star[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 70 }, (_, i) => ({
      id: i, x: rand(0, 100), y: rand(0, 100), size: rand(1, 2.8), delay: rand(0, 6), dur: rand(2.4, 5.5),
    })));
    setPetals(Array.from({ length: 16 }, (_, i) => ({
      id: i, x: rand(0, 100), delay: rand(0, 14), dur: rand(10, 20), size: rand(10, 20), sway: rand(-1, 1), kind: i % 3,
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Moon / soft orb */}
      <div
        className="absolute rounded-full"
        style={{
          top: "8%", right: "10%", width: 120, height: 120,
          background: "radial-gradient(circle at 38% 38%, rgb(var(--accent) / 0.5), rgb(var(--accent-2) / 0.18) 55%, transparent 72%)",
          filter: "blur(2px)", animation: "floaty 9s ease-in-out infinite",
        }}
      />

      {/* Starfield */}
      {stars.map(s => (
        <span
          key={`s${s.id}`}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
            background: "rgb(var(--text))",
            boxShadow: "0 0 6px rgb(var(--text) / 0.8)",
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Falling sakura petals */}
      {petals.map(p => (
        <span
          key={`p${p.id}`}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.15))" }}>
            <path
              d="M12 2c3 4 7 6 7 11 0 4-3 7-7 7s-7-3-7-7c0-5 4-7 7-11z"
              fill={p.kind === 0 ? "rgb(var(--accent) / 0.8)" : p.kind === 1 ? "rgb(var(--accent-2) / 0.75)" : "rgb(255 255 255 / 0.55)"}
            />
            <path d="M12 6c1.5 3 3 4 3 7" stroke="rgb(255 255 255 / 0.4)" strokeWidth="0.8" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  );
}
