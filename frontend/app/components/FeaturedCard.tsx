"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink } from "lucide-react";
import type { AnimeResult } from "@/lib/api";

function getAccent(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#e05263", "#4a7fa5", "#b36b8a", "#5a8f7b", "#7c6af7"];
  return colors[Math.abs(hash) % colors.length];
}

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
}

export function FeaturedCard({ anime }: { anime: AnimeResult }) {
  const accent = getAccent(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters   ?? 0;

  return (
    <motion.div
      className="relative w-full rounded-xl overflow-hidden mb-5 glass"
      style={{ minHeight: "220px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />

      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 50%, ${accent}08 0%, transparent 60%)` }}
      />

      <div className="relative p-8 md:p-10">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}
          >
            #1 top pick
          </span>
          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            {matchedCount}/{totalCount} filters matched
          </span>
          {anime.cluster_label && (
            <span
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
            >
              {anime.cluster_label}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="font-bold text-white mb-3"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.4rem)", lineHeight: 1.05, letterSpacing: "-0.025em", maxWidth: "580px" }}
        >
          {anime.title}
        </h2>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {anime.genre.split(",").slice(0, 5).map(g => g.trim()).filter(Boolean).map(g => (
            <span
              key={g}
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}
            >
              {g.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Summary */}
        {anime.summary && (
          <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.38)", maxWidth: "520px" }}>
            {anime.summary.length > 160 ? anime.summary.slice(0, 160) + "…" : anime.summary}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {anime.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" style={{ fill: accent, stroke: accent }} />
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{anime.rating.toFixed(1)}</span>
              </span>
            )}
            {anime.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {anime.year}
              </span>
            )}
            {anime.votes && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {formatVotes(anime.votes)}
              </span>
            )}
          </div>

          <a
            href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded transition-opacity duration-200 hover:opacity-80"
            style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
          >
            <ExternalLink className="w-3 h-3" />
            view on MAL
          </a>
        </div>
      </div>

      {/* Rank watermark */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 font-black select-none pointer-events-none font-mono"
        style={{ fontSize: "clamp(5rem, 14vw, 10rem)", lineHeight: 1, color: "rgba(255,255,255,0.025)", letterSpacing: "-0.05em" }}
      >
        01
      </div>
    </motion.div>
  );
}
