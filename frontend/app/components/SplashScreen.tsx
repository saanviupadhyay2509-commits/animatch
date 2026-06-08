"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props { visible: boolean; }

export function SplashScreen({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "#12100e" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Warm glow */}
          <div style={{
            position: "absolute",
            width: "400px", height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,165,90,0.18), transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }} />

          {/* Torii silhouette */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "28px", position: "relative" }}
          >
            <svg width="80" height="80" viewBox="0 0 340 340" fill="none">
              <path d="M20 80 Q170 55 320 80" stroke="#c9a55a" strokeWidth="18" strokeLinecap="round" fill="none"/>
              <line x1="60" y1="115" x2="280" y2="115" stroke="#c9a55a" strokeWidth="10" strokeLinecap="round"/>
              <line x1="95" y1="110" x2="95" y2="320" stroke="#c9a55a" strokeWidth="14" strokeLinecap="round"/>
              <line x1="245" y1="110" x2="245" y2="320" stroke="#c9a55a" strokeWidth="14" strokeLinecap="round"/>
              <line x1="72" y1="300" x2="118" y2="300" stroke="#c9a55a" strokeWidth="10" strokeLinecap="round"/>
              <line x1="222" y1="300" x2="268" y2="300" stroke="#c9a55a" strokeWidth="10" strokeLinecap="round"/>
              <circle cx="170" cy="97" r="8" fill="#c9a55a"/>
            </svg>

            {/* Orbiting sakura */}
            <motion.div
              style={{
                position: "absolute", top: "-6px", left: "50%",
                fontSize: "0.75rem", color: "#d4868a",
                transformOrigin: "50% 46px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              ✿
            </motion.div>
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: "linear-gradient(160deg, #f0e0c0 0%, #c9a55a 50%, #96713a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AniMatch
          </motion.div>

          {/* Japanese subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              marginTop: "6px",
              fontFamily: "'Shippori Mincho', serif",
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "rgba(201,165,90,0.35)",
            }}
          >
            アニメ・マッチ
          </motion.p>

          {/* Loading bar */}
          <motion.div
            style={{
              position: "absolute", bottom: "48px",
              width: "100px", height: "1px",
              background: "rgba(201,165,90,0.1)", borderRadius: "1px", overflow: "hidden",
            }}
          >
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, #c9a55a, #e8c07a)", borderRadius: "1px" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
