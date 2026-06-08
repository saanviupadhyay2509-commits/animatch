"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import { FeaturedCard } from "./FeaturedCard";
import type { AnimeResult } from "@/lib/api";

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div className="glass rounded-xl overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}>
      <div className="h-[2px] skeleton" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between"><div className="skeleton h-8 w-10 rounded" /><div className="skeleton h-3 w-20 rounded" /></div>
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-2"><div className="skeleton h-5 w-12 rounded" /><div className="skeleton h-5 w-16 rounded" /></div>
        <div className="skeleton h-3 w-full rounded" />
      </div>
    </motion.div>
  );
}

interface Props {
  results: AnimeResult[] | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function ResultsGrid({ results, loading, error, onRetry }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-32">
      <AnimatePresence mode="wait">

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="font-mono text-[11px] tracking-wide mb-6" style={{ color: "rgba(201,165,90,0.35)" }}>
              ✦ searching {(Math.random() * 4000 + 1000).toFixed(0)} titles...
            </p>
            <div className="glass rounded-xl skeleton mb-5" style={{ height: "230px" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
            </div>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-10 text-center max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-4" style={{ color: "#d4868a" }} />
            <p className="font-display font-bold mb-2" style={{ color: "rgba(232,221,208,0.7)", fontSize: "0.95rem" }}>No results found</p>
            <p className="font-mono text-xs mb-6" style={{ color: "rgba(232,221,208,0.3)" }}>{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 mx-auto font-mono text-xs transition-colors"
                style={{ color: "rgba(201,165,90,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#c9a55a")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,165,90,0.6)")}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                try different filters
              </button>
            )}
          </motion.div>
        )}

        {!loading && results && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Header */}
            <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-[2px] h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #c9a55a, rgba(201,165,90,0.2))" }} />
              <div>
                <h2 className="font-display font-bold text-lg" style={{ color: "#e8ddd0", letterSpacing: "-0.02em" }}>
                  Your Recommendations
                </h2>
                <p className="font-mono text-[10px] tracking-wide" style={{ color: "rgba(201,165,90,0.4)" }}>
                  {results.length} titles · ranked by cluster, rating & popularity
                </p>
              </div>
            </motion.div>

            <FeaturedCard anime={results[0]} />

            {results.length > 1 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[2px] h-4 rounded-full" style={{ background: "rgba(201,165,90,0.2)" }} />
                  <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,165,90,0.3)" }}>
                    more picks for you
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.slice(1).map((anime, i) => (
                    <AnimeCard key={anime.title + i} anime={anime} index={i} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
