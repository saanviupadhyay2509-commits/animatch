"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props { visible: boolean; }

export function SplashScreen({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
          style={{ background: "rgb(var(--bg))" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient glow */}
          <div style={{
            position: "absolute", width: "520px", height: "520px", borderRadius: "50%",
            background: "radial-gradient(circle, rgb(var(--accent) / 0.16) 0%, transparent 55%)",
            filter: "blur(50px)", pointerEvents: "none",
          }} />

          {/* Orbital mark */}
          <motion.div
            className="relative grid place-items-center mb-7"
            style={{ width: 84, height: 84 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from 0deg, rgb(var(--accent)), rgb(var(--accent-2)), rgb(var(--accent)))" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
            <span className="absolute rounded-full" style={{ inset: 5, background: "rgb(var(--bg))" }} />
            <motion.span
              className="absolute rounded-full"
              style={{ width: 10, height: 10, background: "rgb(var(--accent))", top: -2, left: "50%", marginLeft: -5, boxShadow: "0 0 14px rgb(var(--accent) / 0.8)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative w-2 h-2 rounded-full" style={{ background: "rgb(var(--accent))" }} />
          </motion.div>

          <motion.div
            className="font-display gradient-text"
            style={{ fontSize: "2.4rem", fontWeight: 600, letterSpacing: "-0.03em" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            AniMatch
          </motion.div>

          <motion.p
            className="font-mono mt-2"
            style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgb(var(--text) / 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            living spectrum
          </motion.p>

          {/* Loading bar */}
          <div style={{
            position: "absolute", bottom: "52px", width: "110px", height: "2px",
            background: "rgb(var(--accent) / 0.12)", borderRadius: "2px", overflow: "hidden",
          }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))", borderRadius: "2px" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.9, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
