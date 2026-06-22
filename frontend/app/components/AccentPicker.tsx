"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeEngine";

export function AccentPicker() {
  const { presetId, setPresetId, presets, zone } = useTheme();
  const [open, setOpen] = useState(false);
  const current = presets.find(p => p.id === presetId) ?? presets[0];

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-3 w-[200px]"
            style={{
              background: "rgb(var(--surface) / 0.85)",
              border: "1px solid rgb(var(--accent) / 0.18)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgb(0 0 0 / 0.45)",
            }}
          >
            <p className="font-mono text-[9px] tracking-widest uppercase px-1 pb-2" style={{ color: "rgb(var(--text) / 0.4)" }}>
              colour journey
            </p>
            <div className="space-y-1">
              {presets.map(p => {
                const active = p.id === presetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
                    style={{ background: active ? "rgb(var(--accent) / 0.12)" : "transparent" }}
                  >
                    {/* gradient preview of the journey */}
                    <span
                      className="w-7 h-7 rounded-md shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${p.zones[0].accent}, ${p.zones[1].accent} 50%, ${p.zones[2].accent})`,
                        boxShadow: active ? `0 0 0 1.5px rgb(var(--accent) / 0.6)` : "inset 0 0 0 1px rgb(255 255 255 / 0.08)",
                      }}
                    />
                    <span className="flex-1 text-left font-body text-[13px]" style={{ color: active ? "rgb(var(--text))" : "rgb(var(--text) / 0.65)" }}>
                      {p.name}
                    </span>
                    {active && <Check className="w-3.5 h-3.5" style={{ color: "rgb(var(--accent))" }} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-full transition-all duration-200 hover:brightness-110"
        style={{
          background: "rgb(var(--surface) / 0.8)",
          border: "1px solid rgb(var(--accent) / 0.2)",
          backdropFilter: "blur(12px)",
        }}
        aria-label="Change colour theme"
        title="Change colour theme"
      >
        <span
          className="w-5 h-5 rounded-full grid place-items-center"
          style={{ background: `linear-gradient(135deg, ${current.zones[0].accent}, ${current.zones[2].accent})` }}
        >
          <Palette className="w-3 h-3" style={{ color: "rgb(var(--bg))" }} />
        </span>
        <span className="font-mono text-[11px] tracking-wide" style={{ color: "rgb(var(--text) / 0.6)" }}>
          {current.name.toLowerCase()}
          <span style={{ color: "rgb(var(--text) / 0.3)" }}> · {zone}</span>
        </span>
      </button>
    </div>
  );
}
