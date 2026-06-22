"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randomBirdMessage, type BirdMessageKey } from "../lib/birdMessages";
import { registerBird } from "../lib/birdBus";

/** Mochi — a little star-spirit companion. Floats, blinks, looks at your
 *  cursor, and chatters via the birdBus event bus. */
export function Spirit() {
  const [message, setMessage] = useState("hehe~ hi! ✦");
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [blinking, setBlinking] = useState(false);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [hi, setHi] = useState(false); // happy bounce on interaction

  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf = useRef<number | null>(null);

  function showMessage(key: BirdMessageKey) {
    setMessage(randomBirdMessage(key));
    setBubbleVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBubbleVisible(false), 4200);
  }

  useEffect(() => {
    registerBird(showMessage);
    setMessage(randomBirdMessage("idle"));
  }, []);

  // Idle chatter
  useEffect(() => {
    function schedule() {
      idleTimer.current = setTimeout(() => { showMessage("idle"); schedule(); }, 40000 + Math.random() * 30000);
    }
    schedule();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, []);

  // Blink loop
  useEffect(() => {
    let alive = true;
    function blink() {
      if (!alive) return;
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
      setTimeout(blink, 2600 + Math.random() * 3200);
    }
    const t = setTimeout(blink, 2000);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  // Eye tracking
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy) || 1;
        const max = 2.6;
        setPupil({ x: (dx / d) * max, y: (dy / d) * max });
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); if (raf.current != null) cancelAnimationFrame(raf.current); };
  }, []);

  function poke() {
    setHi(true);
    setTimeout(() => setHi(false), 600);
    showMessage("idle");
  }

  const a = "rgb(var(--accent))";
  const a2 = "rgb(var(--accent-2))";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 select-none">
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            key={message}
            className="bubble px-3.5 py-2 font-body text-[12px] font-medium"
            style={{ color: "rgb(var(--text) / 0.9)", maxWidth: 190 }}
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={wrapRef}
        className="cursor-pointer"
        style={{ width: 78, height: 84 }}
        onClick={poke}
        title="poke me!"
        animate={hi ? { y: [0, -18, 0], rotate: [0, -8, 8, 0] } : { y: [0, -7, 0] }}
        transition={hi ? { duration: 0.6 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
      >
        <svg width="78" height="84" viewBox="0 0 78 84" fill="none">
          <defs>
            <radialGradient id="mochiBody" cx="40%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor={a} stopOpacity="0.95" />
              <stop offset="100%" stopColor={a2} stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* glow */}
          <ellipse cx="39" cy="48" rx="30" ry="30" fill={a} opacity="0.18" />

          {/* little star antenna */}
          <g transform="translate(39 8)">
            <path d="M0 -7 L2 -1 L8 -1 L3 3 L5 9 L0 5 L-5 9 L-3 3 L-8 -1 L-2 -1 Z" fill={a2} opacity="0.95">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
            </path>
          </g>
          <line x1="39" y1="16" x2="39" y2="24" stroke={a2} strokeWidth="2.5" strokeLinecap="round" />

          {/* body */}
          <circle cx="39" cy="50" r="29" fill="url(#mochiBody)" stroke="rgb(255 255 255 / 0.5)" strokeWidth="1.5" />

          {/* stubby arms */}
          <ellipse cx="12" cy="54" rx="6" ry="8" fill={a} opacity="0.9" />
          <ellipse cx="66" cy="54" rx="6" ry="8" fill={a} opacity="0.9" />

          {/* cheeks */}
          <circle cx="25" cy="55" r="5" fill="#ff7aa8" opacity="0.55" />
          <circle cx="53" cy="55" r="5" fill="#ff7aa8" opacity="0.55" />

          {/* eyes */}
          <g transform="translate(0 2)">
            {blinking ? (
              <>
                <path d="M24 47 q5 4 10 0" stroke="#2a1a3a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                <path d="M44 47 q5 4 10 0" stroke="#2a1a3a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <ellipse cx="29" cy="47" rx="6" ry="7.5" fill="#2a1a3a" />
                <ellipse cx="49" cy="47" rx="6" ry="7.5" fill="#2a1a3a" />
                {/* pupils + highlights track the cursor */}
                <g transform={`translate(${pupil.x} ${pupil.y})`}>
                  <circle cx="29" cy="47" r="2.4" fill="#fff" />
                  <circle cx="49" cy="47" r="2.4" fill="#fff" />
                  <circle cx="31" cy="44.5" r="1.1" fill="#fff" opacity="0.9" />
                  <circle cx="51" cy="44.5" r="1.1" fill="#fff" opacity="0.9" />
                </g>
              </>
            )}
          </g>

          {/* smile */}
          <path d="M34 60 q5 5 10 0" stroke="#2a1a3a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
}
