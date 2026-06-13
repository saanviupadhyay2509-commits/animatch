"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "hi! hope you find something good ✿",
  "good taste, by the way",
  "ooh, that one's a favorite of mine",
  "take your time exploring~",
  "psst... try the mood filters too",
];

interface Props {
  trigger: number; // increment this to summon the bird again
}

export function FriendlyBird({ trigger }: Props) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [side, setSide] = useState<"left" | "right">("right");

  useEffect(() => {
    if (trigger === 0) return;

    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setSide(Math.random() > 0.5 ? "right" : "left");
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 z-40 flex items-end gap-2 pointer-events-none select-none"
          style={side === "right" ? { right: "5%" } : { left: "5%" }}
          initial={{ opacity: 0, x: side === "right" ? 60 : -60, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: side === "right" ? 40 : -40, y: -10 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {side === "left" && (
            <motion.div
              className="rounded-2xl px-3.5 py-2 mb-1 font-mono text-[11px]"
              style={{
                background: "rgba(16,22,36,0.92)",
                border: "1px solid rgba(232,184,75,0.22)",
                color: "rgba(242,234,216,0.8)",
                backdropFilter: "blur(10px)",
                maxWidth: "180px",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              {message}
            </motion.div>
          )}

          {/* Bird */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "1.8rem", transform: side === "left" ? "scaleX(-1)" : undefined }}
          >
            🐦
          </motion.div>

          {side === "right" && (
            <motion.div
              className="rounded-2xl px-3.5 py-2 mb-1 font-mono text-[11px]"
              style={{
                background: "rgba(16,22,36,0.92)",
                border: "1px solid rgba(232,184,75,0.22)",
                color: "rgba(242,234,216,0.8)",
                backdropFilter: "blur(10px)",
                maxWidth: "180px",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
