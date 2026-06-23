"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PETALS = [
  { left: "6%",  delay: 0,    dur: 14, char: "✿", size: "1rem",   color: "#e8829a" },
  { left: "15%", delay: 3.5,  dur: 18, char: "❀", size: "0.8rem", color: "#e8b84b" },
  { left: "28%", delay: 1.2,  dur: 12, char: "✿", size: "0.7rem", color: "#e8829a" },
  { left: "44%", delay: 5.5,  dur: 16, char: "❀", size: "0.9rem", color: "#e8b84b" },
  { left: "58%", delay: 2.5,  dur: 13, char: "✿", size: "0.75rem",color: "#e8829a" },
  { left: "71%", delay: 4.2,  dur: 17, char: "❀", size: "0.8rem", color: "#e8b84b" },
  { left: "84%", delay: 0.7,  dur: 15, char: "✿", size: "0.9rem", color: "#e8829a" },
  { left: "93%", delay: 6.5,  dur: 11, char: "❀", size: "0.7rem", color: "#e8b84b" },
];

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [typed, setTyped] = useState("");
  const fullText = "find me something good";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(timer);
    }, 75);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative px-6 pt-36 pb-28 text-center overflow-hidden">

      {/* Floating petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="sakura-petal select-none"
          style={{
            left: p.left,
            top: "-30px",
            fontSize: p.size,
            color: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* Multi-layered ambient glow — indigo + gold */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 40% 0%, rgba(123,159,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 0%, rgba(232,184,75,0.08) 0%, transparent 50%)"
      }} />

      {/* Torii gate — more visible, vermillion tint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.04 }}>
        <svg width="420" height="420" viewBox="0 0 340 340" fill="none">
          <path d="M10 78 Q170 50 330 78" stroke="#e05c3a" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <path d="M5 72 Q170 43 335 72" stroke="#e8b84b" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"/>
          <line x1="45" y1="114" x2="295" y2="114" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <line x1="88" y1="108" x2="88" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
          <line x1="252" y1="108" x2="252" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
          <line x1="66" y1="305" x2="110" y2="305" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <line x1="230" y1="305" x2="274" y2="305" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <circle cx="170" cy="96" r="7" fill="#e8b84b"/>
          <circle cx="170" cy="96" r="12" stroke="#e8b84b" strokeWidth="2" fill="none" opacity="0.4"/>
        </svg>
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 mb-10 px-4 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(232,184,75,0.22)", background: "rgba(232,184,75,0.06)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8b84b", boxShadow: "0 0 6px rgba(232,184,75,0.7)" }} />
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "rgba(232,184,75,0.75)" }}>
            {totalAnime.toLocaleString()} titles · ai-powered
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3"
        >
          <h1
            className="font-display font-bold"
            style={{
              fontSize: "clamp(4rem, 12vw, 8rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              background: "linear-gradient(160deg, #ffffff 0%, #f5d06a 35%, #e8b84b 65%, #c49030 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 50px rgba(232,184,75,0.3))",
            }}
          >
            AniMatch
          </h1>

          {/* Japanese subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              marginTop: "8px",
              fontFamily: "'Shippori Mincho', serif",
              fontSize: "0.9rem",
              letterSpacing: "0.3em",
              color: "rgba(232,184,75,0.45)",
            }}
          >
            アニメ・マッチ
          </motion.p>
        </motion.div>

        {/* Thin gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6"
          style={{
            width: "120px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(232,184,75,0.5), transparent)",
          }}
        />

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="font-mono text-sm mb-12"
          style={{ color: "rgba(242,234,216,0.25)" }}
        >
          <span style={{ color: "rgba(224,92,58,0.7)" }}>❯</span>
          {" "}{typed}
          <span className="animate-pulse" style={{ color: "#e8b84b" }}>▌</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(232,184,75,0.28)" }}>
            scroll to explore
          </span>
          <motion.div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, rgba(232,184,75,0.45), transparent)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
