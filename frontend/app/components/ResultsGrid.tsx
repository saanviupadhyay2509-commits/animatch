"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import { FeaturedCard } from "./FeaturedCard";
import type { AnimeResult } from "@/lib/api";

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="skeleton h-28" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 rounded-lg w-3/4" />
        <div className="skeleton h-3 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-5 rounded-full w-16" />
          <div className="skeleton h-5 rounded-full w-20" />
        </div>
        <div className="skeleton h-3 rounded w-full" />
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
    <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-center text-white/30 font-body text-sm mb-8 tracking-wide">
              Searching {(Math.random() * 4000 + 1000).toFixed(0)} titles…
            </p>
            {/* Featured skeleton */}
            <div className="glass rounded-3xl skeleton mb-6" style={{ height: "260px" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-10 text-center max-w-md mx-auto"
          >
            <AlertCircle className="w-10 h-10 text-red-400/70 mx-auto mb-4" />
            <p className="font-display font-semibold text-white/70 mb-2">No Results Found</p>
            <p className="font-body text-sm text-white/40 mb-6">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 mx-auto text-sm font-body text-purple-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try different filters
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        {!loading && results && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Section header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #7c6af7, #c084fc)" }} />
                <h2 className="font-display font-bold text-xl text-white">
                  Your Recommendations
                </h2>
              </div>
              <p className="font-body text-white/30 text-xs tracking-wide pl-4">
                {results.length} titles ranked by genre match, rating, and popularity
              </p>
            </motion.div>

            {/* #1 — Featured spotlight */}
            <FeaturedCard anime={results[0]} />

            {/* Remaining cards label */}
            {results.length > 1 && (
              <motion.div
                className="flex items-center gap-3 mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(to bottom, #7c6af7, #c084fc)" }} />
                <p className="font-body text-xs font-semibold text-white/35 tracking-widest uppercase">
                  More picks for you
                </p>
              </motion.div>
            )}

            {/* Remaining cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.slice(1).map((anime, i) => (
                <AnimeCard key={anime.title + i} anime={anime} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
