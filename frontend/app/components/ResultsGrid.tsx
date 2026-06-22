"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GachaCard } from "./GachaCard";
import { FeaturedSummon } from "./FeaturedSummon";
import { ResultsToolbar, sortResults, type SortKey } from "./ResultsToolbar";
import type { AnimeResult } from "@/lib/api";

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div className="surface rounded-2xl overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}>
      <div className="h-[2px] skeleton" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="skeleton h-8 w-10 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </motion.div>
  );
}

interface Props {
  results: AnimeResult[] | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  latencyMs: number | null;
}

export function ResultsGrid({ results, loading, error, onRetry, sort, onSortChange, latencyMs }: Props) {
  const sorted = results ? sortResults(results, sort) : null;
  return (
    <section className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-20 pb-32">
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="font-mono text-[11px] tracking-wide mb-6" style={{ color: "rgb(var(--accent) / 0.55)" }}>
              ✦ searching the index…
            </p>
            <div className="surface rounded-2xl skeleton mb-5" style={{ height: "240px" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="surface rounded-2xl p-10 text-center max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-4" style={{ color: "rgb(var(--accent))" }} />
            <p className="font-display mb-2" style={{ color: "rgb(var(--text) / 0.9)", fontSize: "1.1rem" }}>
              the summon fizzled…
            </p>
            <p className="font-mono text-xs mb-6" style={{ color: "rgb(var(--text) / 0.4)" }}>{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 mx-auto font-mono text-xs transition-colors hover:brightness-125"
                style={{ color: "rgb(var(--accent) / 0.75)" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                try a different wish
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        {!loading && sorted && sorted.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <ResultsToolbar
              count={sorted.length}
              latencyMs={latencyMs}
              sort={sort}
              onSortChange={onSortChange}
            />

            {/* #1 featured — re-keyed so it re-animates when the sort changes */}
            <FeaturedSummon key={sorted[0].title} anime={sorted[0]} />

            {/* Rest */}
            {sorted.length > 1 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ color: "rgb(var(--accent) / 0.7)" }}>✦</span>
                  <p className="font-pop text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgb(var(--accent) / 0.6)" }}>
                    more pulls
                  </p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgb(var(--accent) / 0.2), transparent)" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sorted.slice(1).map((anime, i) => (
                    <GachaCard key={anime.title + i} anime={anime} index={i} />
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
