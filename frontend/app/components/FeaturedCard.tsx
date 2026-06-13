"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink } from "lucide-react";
import type { AnimeResult } from "@/lib/api";

function getAccent(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#e8b84b", "#e05c3a", "#e8829a", "#4aaa8e", "#7b9fd4"];
  return colors[Math.abs(hash) % colors.length];
}

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
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
      {/* Top gradient line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, rgba(232,184,75,0.3), transparent)` }} />

      {/* Dual ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 80% 30%, ${accent}0c 0%, transparent 50%),
                     radial-gradient(ellipse at 10% 80%, rgba(123,159,212,0.05) 0%, transparent 40%)`
      }} />

      {/* Torii watermark — vermillion tint */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.05 }}>
        <svg width="160" height="160" viewBox="0 0 340 340" fill="none">
          <path d="M10 78 Q170 50 330 78" stroke="#e05c3a" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <line x1="45" y1="114" x2="295" y2="114" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <line x1="88" y1="108" x2="88" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
          <line x1="252" y1="108" x2="252" y2="325" stroke="#e05c3a" strokeWidth="13" strokeLinecap="round"/>
          <line x1="66" y1="305" x2="110" y2="305" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <line x1="230" y1="305" x2="274" y2="305" stroke="#e05c3a" strokeWidth="9" strokeLinecap="round"/>
          <circle cx="170" cy="96" r="7" fill="#e8b84b"/>
        </svg>
      </div>

      <div className="relative p-8 md:p-10">

        {/* Top row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded"
            style={{ background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }}
          >
            ✦ top pick
          </span>
          <span className="font-mono text-[10px]" style={{ color: "rgba(242,234,216,0.28)" }}>
            {matchedCount}/{totalCount} matched
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-display font-bold mb-2"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            maxWidth: "560px",
            background: "linear-gradient(160deg, #ffffff 0%, #f5d06a 50%, #e8b84b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 30px rgba(232,184,75,0.2))",
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
                background: "rgba(232,184,75,0.07)",
                border: "1px solid rgba(232,184,75,0.15)",
                color: "rgba(242,234,216,0.45)",
                letterSpacing: "0.04em",
              }}
            >
              {g.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Summary */}
        {anime.summary && (
          <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "rgba(242,234,216,0.4)", maxWidth: "500px" }}>
            {anime.summary.length > 155 ? anime.summary.slice(0, 155) + "…" : anime.summary}
          </p>
        )}

        {/* Why this pick — explainability panel */}
        <div
          className="mb-5 rounded-lg px-4 py-3"
          style={{
            background: "rgba(232,184,75,0.05)",
            border: "1px solid rgba(232,184,75,0.14)",
            maxWidth: "500px",
          }}
        >
          <p className="font-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(232,184,75,0.55)" }}>
            ◈ why this pick
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px]" style={{ color: "rgba(242,234,216,0.5)" }}>
            <span>
              <span style={{ color: accent }}>{Math.round(anime.similarity * 100)}%</span> genre similarity
            </span>
            <span>
              predicted score <span style={{ color: accent }}>{anime.predicted_rating.toFixed(1)}</span>/10
            </span>
            {anime.matched_filters?.length > 0 && (
              <span>
                matched <span style={{ color: accent }}>{anime.matched_filters.join(", ")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-5 font-mono text-xs" style={{ color: "rgba(242,234,216,0.35)" }}>
            {anime.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" style={{ fill: accent, stroke: accent }} />
                <span style={{ color: "rgba(242,234,216,0.8)" }}>{anime.rating.toFixed(1)}</span>
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
            style={{ background: `${accent}18`, border: `1px solid ${accent}38`, color: accent }}
          >
            <ExternalLink className="w-3 h-3" />
            view on MAL
          </a>
        </div>
      </div>

      {/* Rank watermark */}
      <div
        className="absolute right-8 bottom-4 font-display font-bold select-none pointer-events-none"
        style={{ fontSize: "clamp(5rem, 13vw, 9rem)", lineHeight: 1, color: "rgba(232,184,75,0.05)", letterSpacing: "-0.05em" }}
      >
        01
      </div>
    </motion.div>
  );
}
