"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink } from "lucide-react";
import type { AnimeResult } from "@/lib/api";

function getAccent(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#c9a55a", "#d4868a", "#8b9d6e", "#7a8fa8", "#b87a5a"];
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
      style={{ minHeight: "230px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top gradient bar */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, rgba(201,165,90,0.2), transparent)` }} />

      {/* Warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 75% 40%, ${accent}0d 0%, transparent 55%)` }}
      />

      {/* Torii watermark */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.04 }}>
        <svg width="180" height="180" viewBox="0 0 340 340" fill="none">
          <path d="M20 80 Q170 55 320 80" stroke="#c9a55a" strokeWidth="14" strokeLinecap="round" fill="none"/>
          <line x1="50" y1="115" x2="290" y2="115" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          <line x1="90" y1="110" x2="90" y2="320" stroke="#c9a55a" strokeWidth="12" strokeLinecap="round"/>
          <line x1="250" y1="110" x2="250" y2="320" stroke="#c9a55a" strokeWidth="12" strokeLinecap="round"/>
          <line x1="70" y1="300" x2="110" y2="300" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          <line x1="230" y1="300" x2="270" y2="300" stroke="#c9a55a" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="170" cy="97" r="6" fill="#c9a55a"/>
        </svg>
      </div>

      <div className="relative p-8 md:p-10">

        {/* Top row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}
          >
            ✦ top pick
          </span>
          <span className="font-mono text-[10px]" style={{ color: "rgba(232,221,208,0.25)" }}>
            {matchedCount}/{totalCount} matched
          </span>
          {anime.cluster_label && (
            <span
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{ background: "rgba(201,165,90,0.07)", border: "1px solid rgba(201,165,90,0.15)", color: "rgba(201,165,90,0.6)" }}
            >
              ◈ {anime.cluster_label}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="font-display font-bold text-white mb-1"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            maxWidth: "560px",
            background: "linear-gradient(160deg, #f0e0c0 0%, #c9a55a 60%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {anime.title}
        </h2>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {anime.genre.split(",").slice(0, 5).map(g => g.trim()).filter(Boolean).map(g => (
            <span
              key={g}
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{
                background: "rgba(201,165,90,0.06)",
                border: "1px solid rgba(201,165,90,0.14)",
                color: "rgba(232,221,208,0.42)",
                letterSpacing: "0.04em",
              }}
            >
              {g.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Summary */}
        {anime.summary && (
          <p
            className="font-body text-sm leading-relaxed mb-5"
            style={{ color: "rgba(232,221,208,0.38)", maxWidth: "500px" }}
          >
            {anime.summary.length > 155 ? anime.summary.slice(0, 155) + "…" : anime.summary}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-5 font-mono text-xs" style={{ color: "rgba(232,221,208,0.35)" }}>
            {anime.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" style={{ fill: accent, stroke: accent }} />
                <span style={{ color: "rgba(232,221,208,0.75)" }}>{anime.rating.toFixed(1)}</span>
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
            className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded transition-opacity hover:opacity-80"
            style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
          >
            <ExternalLink className="w-3 h-3" />
            view on MAL
          </a>
        </div>
      </div>

      {/* Rank watermark */}
      <div
        className="absolute right-8 bottom-4 font-display font-bold select-none pointer-events-none"
        style={{ fontSize: "clamp(5rem, 13vw, 9rem)", lineHeight: 1, color: "rgba(201,165,90,0.04)", letterSpacing: "-0.05em" }}
      >
        01
      </div>
    </motion.div>
  );
}
