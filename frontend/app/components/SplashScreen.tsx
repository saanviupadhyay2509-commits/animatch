"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props { visible: boolean; }

export function SplashScreen({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "#0e1520" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dual ambient glow */}
          <div style={{
            position: "absolute", width: "500px", height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 50%, rgba(232,184,75,0.12) 0%, transparent 50%), radial-gradient(circle at 60% 50%, rgba(123,159,212,0.08) 0%, transparent 50%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />

          {/* Torii gate logo */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", marginBottom: "28px" }}
          >
            <svg width="72" height="72" viewBox="0 0 340 340" fill="none">
              <path d="M10 78 Q170 50 330 78" stroke="#e05c3a" strokeWidth="18" strokeLinecap="round" fill="none"/>
              <path d="M5 71 Q170 42 335 71" stroke="#e8b84b" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.6"/>
              <line x1="45" y1="114" x2="295" y2="114" stroke="#e05c3a" strokeWidth="10" strokeLinecap="round"/>
              <line x1="88" y1="108" x2="88" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
              <line x1="252" y1="108" x2="252" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
              <line x1="66" y1="305" x2="110" y2="305" stroke="#e05c3a" strokeWidth="10" strokeLinecap="round"/>
              <line x1="230" y1="305" x2="274" y2="305" stroke="#e05c3a" strokeWidth="10" strokeLinecap="round"/>
              <circle cx="170" cy="96" r="8" fill="#e8b84b"/>
              <circle cx="170" cy="96" r="13" stroke="#e8b84b" strokeWidth="1.5" fill="none" opacity="0.4"/>
            </svg>

            {/* Orbiting sakura petal */}
            <motion.span
              style={{
                position: "absolute",
                top: "-8px",
                left: "50%",
                fontSize: "0.85rem",
                color: "#e8829a",
                transformOrigin: "50% 44px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              ✿
            </motion.span>
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
              background: "linear-gradient(160deg, #ffffff 0%, #f5d06a 40%, #e8b84b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px rgba(232,184,75,0.3))",
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
              color: "rgba(232,184,75,0.4)",
            }}
          >
            アニメ・マッチ
          </motion.p>

          {/* Loading bar */}
          <motion.div
            style={{
              position: "absolute", bottom: "48px",
              width: "100px", height: "1px",
              background: "rgba(232,184,75,0.1)",
              borderRadius: "1px", overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #e05c3a, #e8b84b, #f5d06a)",
                borderRadius: "1px",
              }}
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
