"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [typed, setTyped] = useState("");
  const fullText = "find me something good";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 75);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative px-6 pt-32 pb-24 text-center overflow-hidden">

      {/* Subtle ambient — not overdone */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(224,82,99,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#e05263] animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/35">
            {totalAnime.toLocaleString()} titles indexed
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-bold tracking-tighter mb-5"
          style={{ fontSize: "clamp(3.5rem, 10vw, 6.5rem)", lineHeight: 0.95, letterSpacing: "-0.04em" }}
        >
          <span style={{ color: "#e05263" }}>ani</span>
          <span style={{ color: "#e2e2e8" }}>match</span>
        </motion.h1>

        {/* Terminal line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="font-mono text-sm mb-10"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          <span style={{ color: "#4a7fa5" }}>$</span>
          {" "}{typed}
          <span className="animate-pulse" style={{ color: "#e05263" }}>_</span>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/15">configure below</span>
          <motion.div
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, rgba(224,82,99,0.4), transparent)" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
