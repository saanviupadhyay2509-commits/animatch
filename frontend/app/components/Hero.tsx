"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";

interface Props {
  totalAnime: number;
  onGenerate: () => void;
  onExplore: () => void;
}

// Abstract "poster wall" — silhouettes only, no copyrighted art.
function PosterWall() {
  const cols = Array.from({ length: 7 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <div
        className="absolute inset-x-0 -top-10 bottom-0 flex justify-center gap-3 opacity-[0.10]"
        style={{ maskImage: "linear-gradient(to bottom, black, transparent 78%)", WebkitMaskImage: "linear-gradient(to bottom, black, transparent 78%)" }}
      >
        {cols.map((_, c) => (
          <div key={c} className="flex flex-col gap-3" style={{ transform: `translateY(${(c % 3) * 26 - 26}px)` }}>
            {Array.from({ length: 5 }).map((_, r) => (
              <div
                key={r}
                style={{
                  width: 116, height: 168, borderRadius: 12,
                  background: `linear-gradient(150deg, var(--surface-2), var(--surface))`,
                  border: "1px solid var(--border)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* indigo wash from top */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 50% -5%, rgba(99,102,241,0.16), transparent 70%)" }} />
    </div>
  );
}

export function Hero({ totalAnime, onGenerate, onExplore }: Props) {
  return (
    <section className="relative px-6 pt-20 pb-16 md:pt-28 md:pb-20">
      <PosterWall />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide mb-7"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          AI-POWERED ANIME DISCOVERY
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="font-serif"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", lineHeight: 1.02, color: "var(--text)" }}
        >
          Find your next favorite anime.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-6 max-w-xl text-[15px] md:text-base leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          AniMatch uses intelligent recommendation models to reduce endless scrolling
          and help you discover anime you&rsquo;ll actually enjoy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-9"
        >
          <button onClick={onGenerate} className="btn btn-primary text-[15px] px-5 py-3">
            <Sparkles className="w-[18px] h-[18px]" />
            Generate Recommendations
          </button>
          <button onClick={onExplore} className="btn btn-secondary text-[15px] px-5 py-3">
            <TrendingUp className="w-[18px] h-[18px]" />
            Explore Trending
            <ArrowRight className="w-4 h-4 opacity-60" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-7 text-[12.5px]" style={{ color: "var(--text-subtle)" }}
        >
          {totalAnime.toLocaleString()} titles analyzed · TF-IDF + K-Means clustering
        </motion.p>
      </div>
    </section>
  );
}
