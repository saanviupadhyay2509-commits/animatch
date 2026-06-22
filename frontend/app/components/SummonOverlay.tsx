"use client";

import { motion, AnimatePresence } from "framer-motion";

const RUNES = "✦✧⭐︎❀✿☆✩❉".split("");

/** Magic-circle ritual shown while a summon (recommendation) is loading. */
export function SummonOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[65] flex flex-col items-center justify-center"
          style={{ background: "rgb(var(--bg) / 0.72)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative"
            style={{ width: 240, height: 240 }}
          >
            <svg viewBox="0 0 240 240" width="240" height="240" fill="none">
              {/* outer rotating ring with runes */}
              <g className="magic-ring">
                <circle cx="120" cy="120" r="112" stroke="rgb(var(--accent) / 0.55)" strokeWidth="1.5" strokeDasharray="3 9" />
                {RUNES.map((ru, i) => {
                  const ang = (i / RUNES.length) * Math.PI * 2;
                  const x = 120 + Math.cos(ang) * 112;
                  const y = 120 + Math.sin(ang) * 112;
                  return (
                    <text key={i} x={x} y={y} fontSize="13" textAnchor="middle" dominantBaseline="central" fill="rgb(var(--accent) / 0.85)">{ru}</text>
                  );
                })}
              </g>
              {/* middle counter-rotating ring */}
              <g className="magic-ring-rev">
                <circle cx="120" cy="120" r="86" stroke="rgb(var(--accent-2) / 0.6)" strokeWidth="1.5" />
                <circle cx="120" cy="120" r="86" stroke="rgb(var(--accent-2) / 0.4)" strokeWidth="6" strokeDasharray="2 26" />
                {/* triangle sigil */}
                <polygon points="120,46 184,158 56,158" stroke="rgb(var(--accent) / 0.5)" strokeWidth="1.2" fill="none" />
                <polygon points="120,194 56,82 184,82" stroke="rgb(var(--accent-2) / 0.5)" strokeWidth="1.2" fill="none" />
              </g>
              {/* inner pulsing core */}
              <motion.circle cx="120" cy="120" r="30" fill="rgb(var(--accent) / 0.25)"
                animate={{ r: [26, 36, 26], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
              <circle cx="120" cy="120" r="10" fill="rgb(var(--accent))" />
            </svg>

            {/* orbiting sparkles */}
            {[0, 1, 2, 3].map(i => (
              <motion.span key={i} className="absolute left-1/2 top-1/2"
                style={{ marginLeft: -4, marginTop: -4 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
              >
                <span className="block" style={{ transform: `translateX(${70 + i * 14}px)` }}>
                  <span className="block w-2 h-2 rounded-full" style={{ background: "rgb(var(--accent))", boxShadow: "0 0 10px rgb(var(--accent))" }} />
                </span>
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            className="font-pop mt-10 text-sm tracking-[0.3em]"
            style={{ color: "rgb(var(--accent))" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            ✦ SUMMONING ✦
          </motion.p>
          <p className="font-mono text-[10px] mt-2 tracking-widest" style={{ color: "rgb(var(--text) / 0.4)" }}>
            キラキラ… searching the archive
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
