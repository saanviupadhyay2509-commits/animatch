"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CHARS = "AniMatch".split("");

// Floating particle — small glowing orbs drifting upward
function Particle({ x, delay, duration, size }: { x: string; delay: number; duration: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        bottom: "-20px",
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(192,132,252,0.8), rgba(124,106,247,0.2))",
        boxShadow: `0 0 ${size * 2}px rgba(124,106,247,0.6)`,
      }}
      animate={{
        y: [0, -500],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0.5, 1, 0.8, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

const PARTICLES = [
  { x: "10%", delay: 0, duration: 8, size: 3 },
  { x: "20%", delay: 1.5, duration: 11, size: 2 },
  { x: "35%", delay: 0.8, duration: 9, size: 4 },
  { x: "50%", delay: 2.2, duration: 7, size: 2 },
  { x: "62%", delay: 0.3, duration: 12, size: 3 },
  { x: "75%", delay: 1.8, duration: 10, size: 2 },
  { x: "85%", delay: 0.6, duration: 8, size: 4 },
  { x: "92%", delay: 2.8, duration: 9, size: 2 },
];

export function Hero({ totalAnime }: { totalAnime: number }) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax layers — each moves at a different rate on scroll
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* Ambient blobs */}
      <div
        className="ambient-blob w-[900px] h-[900px]"
        style={{
          background: "radial-gradient(circle at center, #6d5ef5 0%, #4f46e5 40%, transparent 70%)",
          opacity: 0.22,
          top: "-350px",
          left: "calc(50% - 450px)",
        }}
      />

      <div
        className="ambient-blob w-[550px] h-[550px]"
        style={{
          background: "radial-gradient(circle at center, #f472b6 0%, #c084fc 50%, transparent 70%)",
          opacity: 0.18,
          top: "-50px",
          right: "-180px",
          animationDelay: "-6s",
          animationDuration: "24s",
        }}
      />

      <div
        className="ambient-blob w-[400px] h-[400px]"
        style={{
          background: "radial-gradient(circle at center, #60a5fa 0%, #6366f1 50%, transparent 70%)",
          opacity: 0.14,
          bottom: "-80px",
          left: "-100px",
          animationDelay: "-13s",
          animationDuration: "28s",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Badge */}
      <motion.div
        style={{
          y: badgeY,
          boxShadow:
            "0 0 30px rgba(124,106,247,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 text-[11px] font-body font-medium text-purple-300/80 tracking-widest uppercase"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"
          style={{ boxShadow: "0 0 8px #a78bfa" }}
        />
        {totalAnime.toLocaleString()} titles · AI-powered
      </motion.div>

      <button
       onClick={() => {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      }}
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white"
    >
  Enter Fullscreen
    </button>

      {/* Title with parallax */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="flex items-center gap-0 mb-10"
        aria-label="AniMatch"
      >
        {CHARS.map((char, i) => (
          <motion.span
            key={i}
            className="font-display font-bold"
            style={{
              fontSize: "clamp(4.5rem, 12vw, 9rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              background:
                "linear-gradient(160deg, #ffffff 0%, #d4d4d8 35%, #a5b4fc 70%, #7dd3fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 32px rgba(124,106,247,0.28))",
            }}
            initial={{ 
              opacity: 0,
              y: 24,
              filter: "blur(10px)",
            }}
            animate={{ 
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1.4,
              delay: i * 0.045,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* Subtitle with parallax */}
      <motion.div
        style={{ y: subtitleY, opacity: subtitleOpacity }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-1"
      >
        <p
          className="font-body text-xl md:text-2xl"
          style={{
            color: "rgba(255,255,255,0.55)",
            fontWeight: 300,
            letterSpacing: "0.02em",
          }}
        >
          Discover your next obsession.
        </p>

        <p
          className="font-body text-base md:text-lg"
          style={{
            color: "rgba(255,255,255,0.2)",
            fontWeight: 300,
            letterSpacing: "0.03em",
          }}
        >
          Tell us your mood. We handle the rest.
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="mt-16 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
      >
        <motion.div
          className="w-px"
          style={{
            height: "64px",
            background:
              "linear-gradient(to bottom, rgba(124,106,247,0.6), rgba(124,106,247,0.1), transparent)",
          }}
          animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}