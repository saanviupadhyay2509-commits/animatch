"use client";

import { useCallback, useEffect, useState } from "react";

// A tiny synthesized-sound layer (no audio assets). Gentle, optional, muteable.

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine") {
  const ac = audio(); if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const MUTE_KEY = "animatch:muted";

export function useSound() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try { setMuted(localStorage.getItem(MUTE_KEY) === "1"); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setMuted(m => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      if (!next) tone(880, 0, 0.12, 0.05); // little confirmation blip when unmuting
      return next;
    });
  }, []);

  // Sparkly ascending arpeggio for a summon.
  const summon = useCallback(() => {
    if (muted) return;
    const notes = [659.25, 783.99, 987.77, 1318.5]; // E5 G5 B5 E6
    notes.forEach((f, i) => tone(f, i * 0.085, 0.5, 0.05, "triangle"));
    tone(1567.98, 0.34, 0.6, 0.03, "sine"); // shimmer top
  }, [muted]);

  // Soft pop for adding to collection.
  const pop = useCallback(() => {
    if (muted) return;
    tone(523.25, 0, 0.12, 0.04, "sine");
    tone(1046.5, 0.04, 0.18, 0.035, "triangle");
  }, [muted]);

  return { muted, toggle, summon, pop };
}
