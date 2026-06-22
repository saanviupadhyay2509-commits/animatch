"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeEngine";

const ZONES: { id: string; label: string; anchor: string }[] = [
  { id: "night", label: "night", anchor: "hero" },
  { id: "dusk",  label: "dusk",  anchor: "altar" },
  { id: "dawn",  label: "dawn",  anchor: "results" },
];

export function ZoneRail() {
  const { zone } = useTheme();

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-5">
      {ZONES.map((z, i) => {
        const active = z.id === zone;
        return (
          <button
            key={z.id}
            onClick={() => document.getElementById(z.anchor)?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center gap-3"
            aria-label={`Jump to ${z.label}`}
          >
            <span className="font-mono text-[9px] tabular-nums" style={{ color: active ? "rgb(var(--accent))" : "rgb(var(--text) / 0.25)" }}>
              0{i + 1}
            </span>
            <span className="relative block" style={{ width: 28, height: 2 }}>
              <span className="absolute inset-0 rounded-full" style={{ background: "rgb(var(--text) / 0.15)" }} />
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "rgb(var(--accent))" }}
                animate={{ width: active ? "100%" : "30%", opacity: active ? 1 : 0.4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span
              className="font-mono text-[10px] tracking-widest uppercase transition-all duration-300"
              style={{
                color: active ? "rgb(var(--text) / 0.8)" : "rgb(var(--text) / 0.3)",
                opacity: active ? 1 : 0,
                transform: active ? "translateX(0)" : "translateX(-4px)",
              }}
            >
              {z.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
