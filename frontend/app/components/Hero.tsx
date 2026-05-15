"use client";

import { motion } from "framer-motion";

const CHARS = "AniMatch".split("");

export function Hero({ totalAnime }: { totalAnime: number }) {
  return (
    <section className="relative flex flex-col items-center justify-center pt-28 pb-16 px-6 text-center overflow-hidden">

      {/* Ambient background blobs */}
      <div
        className="ambient-blob w-[600px] h-[600px] opacity-20"
        style={{ background: "#7c6af7", top: "-200px", left: "calc(50% - 300px)" }}
      />
      <div
        className="ambient-blob w-[400px] h-[400px] opacity-15"
        style={{
          background: "#f472b6",
          top: "100px",
          right: "-100px",
          animationDelay: "-6s",
          animationDuration: "22s",
        }}
      />
      <div
        className="ambient-blob w-[300px] h-[300px] opacity-10"
        style={{
          background: "#60a5fa",
          bottom: "0px",
          left: "-80px",
          animationDelay: "-12s",
          animationDuration: "26s",
        }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-body font-medium text-purple-300"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        <span>{totalAnime.toLocaleString()} anime titles · Content-based AI</span>
      </motion.div>

      {/* Title with staggered character animation */}
      <div className="flex items-baseline gap-0 mb-4 overflow-hidden" aria-label="AniMatch">
        {CHARS.map((char, i) => (
          <motion.span
            key={i}
            className="font-display font-bold gradient-text"
            style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", lineHeight: 1 }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
      >
        Discover your next obsession. Tell us your mood — we&apos;ll handle the rest.
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-xs text-white/25 font-body tracking-widest uppercase">Configure below</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-purple-500/60 to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
