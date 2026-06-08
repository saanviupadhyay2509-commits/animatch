"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PETALS = [
  { left: "8%",  delay: 0,    duration: 12, size: "0.7rem" },
  { left: "18%", delay: 3,    duration: 15, size: "0.9rem" },
  { left: "32%", delay: 1.5,  duration: 11, size: "0.6rem" },
  { left: "48%", delay: 5,    duration: 14, size: "0.8rem" },
  { left: "61%", delay: 2.2,  duration: 13, size: "0.7rem" },
  { left: "74%", delay: 4.5,  duration: 16, size: "0.9rem" },
  { left: "88%", delay: 0.8,  duration: 12, size: "0.6rem" },
];

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [typed, setTyped] = useState("");
  const fullText = "find me something good";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative px-6 pt-36 pb-28 text-center overflow-hidden">

      {/* Sakura petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="sakura-petal select-none"
          style={{
            left: p.left,
            top: "-30px",
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          ✿
        </span>
      ))}

      {/* Warm radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, rgba(201,165,90,0.07) 0%, transparent 65%)" }}
      />

      {/* Torii gate watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.025 }}>
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top crossbeam with upswept ends */}
          <path d="M20 80 Q170 55 320 80" stroke="#c9a55a" strokeWidth="14" strokeLinecap="round" fill="none"/>
          {/* Second crossbeam */}
          <line x1="50" y1="115" x2="290" y2="115" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          {/* Left pillar */}
          <line x1="90" y1="110" x2="90" y2="320" stroke="#c9a55a" strokeWidth="12" strokeLinecap="round"/>
          {/* Right pillar */}
          <line x1="250" y1="110" x2="250" y2="320" stroke="#c9a55a" strokeWidth="12" strokeLinecap="round"/>
          {/* Left footing */}
          <line x1="70" y1="300" x2="110" y2="300" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          {/* Right footing */}
          <line x1="230" y1="300" x2="270" y2="300" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          {/* Center ornament */}
          <circle cx="170" cy="97" r="6" fill="#c9a55a"/>
        </svg>
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 mb-10 px-4 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(201,165,90,0.2)", background: "rgba(201,165,90,0.05)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a55a" }} />
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "rgba(201,165,90,0.7)" }}>
            {totalAnime.toLocaleString()} titles · ai-powered
          </span>
        </motion.div>

        {/* Main title — Shippori Mincho for that Japanese serif feel */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h1
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(3.8rem, 11vw, 7.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              background: "linear-gradient(160deg, #f0e0c0 0%, #c9a55a 45%, #96713a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(201,165,90,0.2))",
            }}
          >
            AniMatch
          </h1>
          {/* Japanese subtitle */}
          <p
            className="font-display mt-2"
            style={{ fontSize: "0.85rem", color: "rgba(201,165,90,0.4)", letterSpacing: "0.25em" }}
          >
            アニメ・マッチ
          </p>
        </motion.div>

        {/* Terminal line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="font-mono text-sm mb-12"
          style={{ color: "rgba(232,221,208,0.22)" }}
        >
          <span style={{ color: "rgba(201,165,90,0.5)" }}>❯</span>
          {" "}{typed}
          <span className="animate-pulse" style={{ color: "#c9a55a" }}>▌</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,165,90,0.25)" }}>
            scroll to explore
          </span>
          <motion.div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, rgba(201,165,90,0.4), transparent)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
