"use client";

import { motion } from "framer-motion";
import { Compass, RotateCcw, AlertCircle } from "lucide-react";
import { ResultCard } from "./ResultCard";
import { PipelineLoader } from "./PipelineLoader";
import type { AnimeResult } from "@/lib/api";

const SUGGESTIONS = [
  { label: "Fantasy", desc: "Magic, worlds, adventure", query: "epic fantasy with great world-building" },
  { label: "Cozy Slice of Life", desc: "Warm, low-stakes, comforting", query: "cozy slice of life, relaxing" },
  { label: "Mind-bending Mystery", desc: "Twists & psychology", query: "dark mystery with psychological twists" },
  { label: "Weekend Marathon", desc: "Bingeable & gripping", query: "action anime I can binge all weekend" },
];

interface Props {
  results: AnimeResult[] | null;
  loading: boolean;
  error: string | null;
  onSuggest: (query: string) => void;
  onRetry: () => void;
}

export function Results({ results, loading, error, onSuggest, onRetry }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24 pt-10">
      {/* Loading — the signature pipeline reveal */}
      {loading && <PipelineLoader />}

      {/* Error */}
      {!loading && error && (
        <div className="card max-w-md mx-auto p-8 text-center">
          <AlertCircle className="w-7 h-7 mx-auto mb-4" style={{ color: "var(--text-subtle)" }} />
          <p className="font-display font-600 mb-1.5" style={{ fontWeight: 600, color: "var(--text)" }}>No matches found</p>
          <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>{error}</p>
          <button onClick={onRetry} className="btn btn-secondary mx-auto text-[13px]">Adjust your search</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !results && (
        <div className="max-w-3xl mx-auto text-center pt-4">
          <h2 className="font-serif text-3xl mb-2" style={{ color: "var(--text)" }}>Not sure what to watch?</h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)" }}>Start with a vibe — AniMatch takes it from there.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUGGESTIONS.map(s => (
              <button key={s.label} onClick={() => onSuggest(s.query)} className="card card-hover p-4 text-left">
                <Compass className="w-5 h-5 mb-3" style={{ color: "var(--accent)" }} />
                <p className="font-display font-600 text-[14px] mb-1" style={{ fontWeight: 600, color: "var(--text)" }}>{s.label}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-subtle)" }}>{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results && results.length > 0 && (
        <div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-600 text-xl" style={{ fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" }}>
                Recommended for you
              </h2>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--text-subtle)" }}>
                {results.length} titles · ranked by similarity &amp; cluster fit
              </p>
            </div>
            <button onClick={onRetry} className="btn btn-ghost text-[13px] hidden sm:inline-flex">
              <RotateCcw className="w-4 h-4" /> Start over
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((a, i) => <ResultCard key={a.title + i} anime={a} index={i} />)}
          </div>
        </div>
      )}
    </section>
  );
}
