"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { PRESETS, getPreset, samplePreset, zoneLabel, type Resolved } from "../lib/theme";

interface ThemeCtx {
  presetId: string;
  setPresetId: (id: string) => void;
  zone: string;            // "night" | "dusk" | "dawn"
  presets: typeof PRESETS;
}

const Ctx = createContext<ThemeCtx | null>(null);
export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used inside <ThemeEngine>");
  return c;
};

const STORAGE_KEY = "animatch:preset";

function apply(r: Resolved) {
  const root = document.documentElement.style;
  root.setProperty("--bg", r.bg);
  root.setProperty("--surface", r.surface);
  root.setProperty("--accent", r.accent);
  root.setProperty("--accent-2", r.accent2);
  root.setProperty("--text", r.text);
}

function scrollProgress(): number {
  const el = document.documentElement;
  const max = el.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  const p = window.scrollY / max;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

export function ThemeEngine({ children }: { children: React.ReactNode }) {
  const presetIdRef = useRef("aurora");
  const [presetId, setPresetIdState] = useState("aurora");
  const [zone, setZone] = useState("night");
  const frame = useRef<number | null>(null);

  const paint = useCallback(() => {
    const p = scrollProgress();
    apply(samplePreset(getPreset(presetIdRef.current), p));
    const z = zoneLabel(p);
    setZone(prev => (prev === z ? prev : z));
  }, []);

  // Drive the palette from native scroll/resize, rAF-throttled.
  useEffect(() => {
    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        paint();
      });
    };

    // Restore saved preset before first paint
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && PRESETS.some(p => p.id === saved)) {
        presetIdRef.current = saved;
        setPresetIdState(saved);
      }
    } catch { /* ignore */ }

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [paint]);

  const setPresetId = useCallback((id: string) => {
    presetIdRef.current = id;
    setPresetIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
    paint(); // re-tint immediately at the current scroll position
  }, [paint]);

  return (
    <Ctx.Provider value={{ presetId, setPresetId, zone, presets: PRESETS }}>
      {children}
    </Ctx.Provider>
  );
}
