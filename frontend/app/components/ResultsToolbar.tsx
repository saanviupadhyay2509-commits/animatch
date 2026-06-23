"use client";

import { motion } from "framer-motion";
import { ArrowUpDown, Zap } from "lucide-react";

export type SortKey = "match" | "rating" | "year" | "title";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "match",  label: "best match" },
  { key: "rating", label: "rating" },
  { key: "year",   label: "newest" },
  { key: "title",  label: "a–z" },
];

interface Props {
  count: number;
  latencyMs: number | null;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}

export function ResultsToolbar({ count, latencyMs, sort, onSortChange }: Props) {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-6 rounded-full" style={{ background: "linear-gradient(to bottom, rgb(var(--accent)), rgb(var(--accent) / 0.2))" }} />
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "rgb(var(--text))", letterSpacing: "-0.02em" }}>
            Your recommendations
          </h2>
          <p className="font-mono text-[10px] tracking-wide flex items-center gap-2" style={{ color: "rgb(var(--accent) / 0.55)" }}>
            <span>{count} titles</span>
            {latencyMs != null && (
              <>
                <span style={{ color: "rgb(var(--accent) / 0.3)" }}>·</span>
                <span className="flex items-center gap-1" style={{ color: "rgb(var(--accent) / 0.7)" }}>
                  <Zap className="w-2.5 h-2.5" /> {latencyMs}ms
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ArrowUpDown className="w-3 h-3" style={{ color: "rgb(var(--accent) / 0.5)" }} />
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgb(var(--surface) / 0.6)", border: "1px solid rgb(var(--accent) / 0.12)" }}>
          {SORT_OPTIONS.map(opt => {
            const active = opt.key === sort;
            return (
              <button
                key={opt.key}
                onClick={() => onSortChange(opt.key)}
                className="relative px-2.5 py-1 rounded-lg font-mono text-[10px] tracking-wide transition-colors"
                style={{ color: active ? "rgb(var(--bg))" : "rgb(var(--text) / 0.45)" }}
              >
                {active && (
                  <motion.span
                    layoutId="sort-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))" }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function sortResults<T extends { rating: number; year: number | null; title: string }>(
  items: T[],
  sort: SortKey,
): T[] {
  if (sort === "match") return items;
  const copy = [...items];
  switch (sort) {
    case "rating": return copy.sort((a, b) => b.rating - a.rating);
    case "year":   return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "title":  return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:       return copy;
  }
}
