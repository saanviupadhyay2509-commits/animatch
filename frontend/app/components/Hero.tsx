"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const WISHES = [
  "something emotional with great fights",
  "cozy romance, high school setting",
  "dark & spooky, recent",
  "a slow-burn mystery that sticks",
  "peak shounen, gorgeous animation",
];

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setW(v => (v + 1) % WISHES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="hero" className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6">

      {/* badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
        style={{ background: "rgb(var(--accent) / 0.12)", border: "1.5px solid rgb(var(--accent) / 0.3)" }}
      >
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} style={{ color: "rgb(var(--accent))" }}>✦</motion.span>
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: "rgb(var(--accent))" }}>
          {totalAnime.toLocaleString()} titles · gacha recommender
        </span>
      </motion.div>

      {/* katakana whisper */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        className="font-pop mb-2 tracking-[0.5em]" style={{ fontSize: "0.85rem", color: "rgb(var(--accent-2) / 0.7)" }}
      >
        アニメ・マッチ
      </motion.p>

      {/* title */}
      <motion.h1
        className="font-display gradient-text glow-text"
        style={{ fontSize: "clamp(3.6rem, 14vw, 9rem)", lineHeight: 0.9, letterSpacing: "-0.02em" }}
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}
      >
        AniMatch
      </motion.h1>

      {/* subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        className="font-body mt-5 max-w-md text-base sm:text-lg"
        style={{ color: "rgb(var(--text) / 0.6)" }}
      >
        Summon your next obsession ✦ tell the spirit a vibe and pull a card.
      </motion.p>

      {/* living wish line */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        className="mt-8 flex items-center justify-center gap-2 font-mono text-sm flex-wrap"
      >
        <span style={{ color: "rgb(var(--accent) / 0.85)" }}>wish:</span>
        <span className="relative inline-block h-[1.5em] overflow-hidden text-left" style={{ minWidth: "min(76vw, 340px)" }}>
          {WISHES.map((v, i) => (
            <motion.span key={v} className="absolute left-0 whitespace-nowrap" style={{ color: "rgb(var(--text) / 0.65)" }}
              initial={false}
              animate={{ y: i === w ? 0 : i < w ? "-115%" : "115%", opacity: i === w ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              “{v}”
            </motion.span>
          ))}
        </span>
        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ color: "rgb(var(--accent))" }}>✦</motion.span>
      </motion.div>

      {/* scroll cue */}
      <motion.button
        onClick={() => document.getElementById("altar")?.scrollIntoView({ behavior: "smooth" })}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="mt-14 flex flex-col items-center gap-2 group"
      >
        <span className="font-pop text-[11px] tracking-[0.25em] uppercase" style={{ color: "rgb(var(--accent))" }}>
          enter the altar
        </span>
        <motion.span className="grid place-items-center w-10 h-10 rounded-full"
          style={{ border: "1.5px solid rgb(var(--accent) / 0.4)", background: "rgb(var(--accent) / 0.08)" }}
          animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.span>
      </motion.button>
    </section>
  );
}
