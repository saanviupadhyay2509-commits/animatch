"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const VIBES = [
  "something emotional with great fights",
  "cozy romance, high school setting",
  "dark and spooky, recent",
  "a slow-burn mystery that sticks",
  "hype shounen, peak animation",
];

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [vibe, setVibe] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setVibe(v => (v + 1) % VIBES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="hero" className="relative min-h-[100svh] flex flex-col justify-center px-6 sm:px-10 lg:px-20 max-w-[1100px] mx-auto">

      {/* Brand row */}
      <motion.div
        className="flex items-center gap-3 mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="relative grid place-items-center" style={{ width: 30, height: 30 }}>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, rgb(var(--accent)), rgb(var(--accent-2)), rgb(var(--accent)))" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <span className="absolute rounded-full" style={{ inset: 4, background: "rgb(var(--bg))" }} />
          <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: "rgb(var(--accent))" }} />
        </span>
        <span className="font-mono text-[12px] tracking-[0.35em] uppercase" style={{ color: "rgb(var(--text) / 0.55)" }}>
          AniMatch
        </span>
      </motion.div>

      {/* Editorial headline */}
      <motion.h1
        className="font-display"
        style={{
          fontSize: "clamp(3.2rem, 11vw, 8.5rem)",
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
          fontWeight: 600,
          color: "rgb(var(--text))",
        }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        Find{" "}
        <span style={{ fontStyle: "italic", fontWeight: 400 }} className="gradient-text">something</span>
        <br />
        good to watch.
      </motion.h1>

      {/* Subhead */}
      <motion.p
        className="font-body mt-8 max-w-lg"
        style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", lineHeight: 1.6, color: "rgb(var(--text) / 0.55)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        A recommender that learns the <em style={{ color: "rgb(var(--accent))", fontStyle: "italic" }}>shape</em> of
        what you like — across {totalAnime.toLocaleString()} titles. Tell it a vibe, or just a name.
      </motion.p>

      {/* Living example line */}
      <motion.div
        className="mt-10 flex items-center gap-3 font-mono text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span style={{ color: "rgb(var(--accent) / 0.8)" }}>try:</span>
        <span className="relative inline-block h-[1.5em] overflow-hidden" style={{ minWidth: "min(70vw, 380px)" }}>
          {VIBES.map((v, i) => (
            <motion.span
              key={v}
              className="absolute left-0 whitespace-nowrap"
              style={{ color: "rgb(var(--text) / 0.6)" }}
              initial={false}
              animate={{ y: i === vibe ? 0 : i < vibe ? "-110%" : "110%", opacity: i === vibe ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              “{v}”
            </motion.span>
          ))}
        </span>
        <span className="animate-pulse" style={{ color: "rgb(var(--accent))" }}>▌</span>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
        className="mt-16 flex items-center gap-3 w-fit group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase transition-colors" style={{ color: "rgb(var(--text) / 0.4)" }}>
          start
        </span>
        <motion.span
          className="block w-9 h-9 rounded-full grid place-items-center"
          style={{ border: "1px solid rgb(var(--accent) / 0.3)" }}
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.span>
      </motion.button>
    </section>
  );
}
