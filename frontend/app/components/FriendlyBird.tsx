"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randomBirdMessage, type BirdMessageKey } from "../lib/birdMessages";
import { registerBird } from "../lib/birdBus";

export function FriendlyBird() {
  // Deterministic first render so SSR and client markup match; randomised after mount.
  const [message, setMessage] = useState("hi there~ ✿");
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMessage(key: BirdMessageKey) {
    setMessage(randomBirdMessage(key));
    setBubbleVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBubbleVisible(false), 4000);
  }

  useEffect(() => {
    registerBird(showMessage);
    // Pick a fresh greeting only after hydration to avoid a server/client mismatch.
    setMessage(randomBirdMessage("idle"));
  }, []);

  // Occasional idle chatter when nothing else is happening
  useEffect(() => {
    function scheduleIdle() {
      idleTimer.current = setTimeout(() => {
        showMessage("idle");
        scheduleIdle();
      }, 45000 + Math.random() * 30000);
    }
    scheduleIdle();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-30 flex items-end gap-2 pointer-events-none select-none">
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            key={message}
            className="rounded-2xl px-3.5 py-2 mb-1 font-mono text-[11px]"
            style={{
              background: "rgb(var(--surface) / 0.92)",
              border: "1px solid rgb(var(--accent) / 0.22)",
              color: "rgb(var(--text) / 0.85)",
              backdropFilter: "blur(10px)",
              maxWidth: "180px",
            }}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="cursor-pointer pointer-events-auto"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: "1.9rem" }}
        onClick={() => showMessage("idle")}
        title="say hi"
      >
        🐦
      </motion.div>
    </div>
  );
}
