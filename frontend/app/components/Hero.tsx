"use client";

import { motion } from "framer-motion";

const CHARS = "AniMatch".split("");

export function Hero({ totalAnime }: { totalAnime: number }) {
  return (
    <section className="relative flex flex-col items-center justify-center pt-36 pb-24 px-6 text-center overflow-hidden">

      {/* Ambient blobs — more vivid and dramatic */}
      <div
        className="ambient-blob w-[800px] h-[800px] opacity-25"
        style={{ background: "radial-gradient(circle, #7c6af7, #4f46e5)", top: "-300px", left: "calc(50% - 400px)" }}
      />
      <div
        className="ambient-blob w-[500px] h-[500px] opacity-20"
        style={{ background: "radial-gradient(circle, #f472b6, #c084fc)", top: "0px", right: "-150px", animationDelay: "-6s", animationDuration: "24s" }}
      />
      <div
        className="ambient-blob w-[350px] h-[350px] opacity-15"
        style={{ background: "radial-gradient(circle, #60a5fa, #6366f1)", bottom: "-50px", left: "-80px", animationDelay: "-13s", animationDuration: "28s" }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 text-[11px] font-body font-medium text-purple-300/80 tracking-widest uppercase"
        style={{ boxShadow: "0 0 30px rgba(124,106,247,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ boxShadow: "0 0 6px #7c6af7" }} />
        {totalAnime.toLocaleString()} titles · AI-powered
      </motion.div>

      {/* Title */}
      <div className="flex items-baseline gap-0 mb-7 overflow-hidden" aria-label="AniMatch">
        {CHARS.map((char, i) => (
          <motion.span
            key={i}
            className="font-display font-bold gradient-text"
            style={{
              fontSize: "clamp(4rem, 11vw, 8rem)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textShadow: "0 0 80px rgba(124,106,247,0.3)",
            }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg md:text-xl max-w-md leading-relaxed mb-3"
        style={{ color: "rgba(255,255,255,0.38)", fontWeight: 300, letterSpacing: "0.01em" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        Discover your next obsession.
        <br />
        <span style={{ color: "rgba(255,255,255,0.22)" }}>Tell us your mood — we'll handle the rest.</span>
      </motion.p>

      {/* Thin divider line */}
      <motion.div
        className="mt-12 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
      >
        <motion.div
          className="w-px bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent"
          style={{ height: "60px" }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
