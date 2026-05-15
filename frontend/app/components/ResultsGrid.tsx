"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
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
        {/* Loading skeletons */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-center text-white/30 font-body text-sm mb-8">
              Searching {(Math.random() * 4000 + 1000).toFixed(0)} titles…
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Error state */}
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
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-display font-bold text-2xl gradient-text mb-1">
                Your Recommendations
              </h2>
              <p className="font-body text-white/35 text-sm">
                {results.length} titles ranked by genre match, rating, and popularity
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((anime, i) => (
                <AnimeCard key={anime.title + i} anime={anime} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
