"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
}

export function SplashScreen({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "#04040d" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient glow behind logo */}
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,106,247,0.35), transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          {/* Logo mark — stylised A in a circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", marginBottom: "28px" }}
          >
            {/* Outer ring */}
            <motion.div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                border: "1px solid rgba(124,106,247,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(124,106,247,0.08)",
                boxShadow: "0 0 40px rgba(124,106,247,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              animate={{ boxShadow: ["0 0 40px rgba(124,106,247,0.25)", "0 0 70px rgba(124,106,247,0.45)", "0 0 40px rgba(124,106,247,0.25)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* A glyph */}
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "2.8rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  background: "linear-gradient(160deg, #ffffff 0%, #c4b5fd 40%, #818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.03em",
                }}
              >
                A
              </span>
            </motion.div>

            {/* Orbiting dot */}
            <motion.div
              style={{
                position: "absolute",
                top: "-4px",
                left: "50%",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#a78bfa",
                boxShadow: "0 0 10px #7c6af7",
                transformOrigin: "50% 49px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: "linear-gradient(160deg, #ffffff 0%, #c4b5fd 40%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AniMatch
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              marginTop: "10px",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            AI Anime Recommendations
          </motion.p>

          {/* Bottom loading bar */}
          <motion.div
            style={{
              position: "absolute",
              bottom: "48px",
              width: "120px",
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #7c6af7, #c084fc)",
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
