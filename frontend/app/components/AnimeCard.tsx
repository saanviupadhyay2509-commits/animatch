"use client";

import { motion } from "framer-motion";
import { Star, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";
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

interface Props { anime: AnimeResult; index: number; }

export function AnimeCard({ anime, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const accent = getAccent(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters   ?? 0;

  return (
    <motion.article
      className="glass glass-hover rounded-xl overflow-hidden cursor-pointer relative"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* Subtle inner glow on hover */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${accent}08 0%, transparent 60%)` }}
        />
      )}

      <div className="relative p-5 space-y-3">

        {/* Rank + meta */}
        <div className="flex items-start justify-between">
          <span
            className="font-display font-bold select-none"
            style={{ fontSize: "2.5rem", lineHeight: 1, color: "rgba(201,165,90,0.06)" }}
          >
            {String(index + 2).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]" style={{ color: "rgba(232,221,208,0.28)" }}>
            <span>{matchedCount}/{totalCount}</span>
            <span style={{ color: "rgba(201,165,90,0.3)" }}>·</span>
            <span>{anime.era}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-display font-bold leading-tight line-clamp-2"
          style={{ fontSize: "0.95rem", color: "#e8ddd0" }}
        >
          {anime.title}
        </h3>

        {/* Cluster label */}
        {anime.cluster_label && (
          <span
            className="inline-block font-mono text-[9px] px-2 py-0.5 rounded"
            style={{
              background: `${accent}10`,
              border: `1px solid ${accent}25`,
              color: accent,
              letterSpacing: "0.05em",
            }}
          >
            ◈ {anime.cluster_label}
          </span>
        )}

        {/* Genre pills */}
        <div className="flex flex-wrap gap-1.5">
          {anime.genre.split(",").slice(0, 3).map(g => g.trim()).filter(Boolean).map(g => (
            <span
              key={g}
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{
                background: "rgba(201,165,90,0.05)",
                border: "1px solid rgba(201,165,90,0.12)",
                color: "rgba(232,221,208,0.4)",
                letterSpacing: "0.04em",
                textTransform: "lowercase",
              }}
            >
              {g.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: "rgba(232,221,208,0.32)" }}>
          {anime.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" style={{ fill: accent, stroke: accent }} />
              <span style={{ color: "rgba(232,221,208,0.65)" }}>{anime.rating.toFixed(1)}</span>
            </span>
          )}
          {anime.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {anime.year}
            </span>
          )}
          {anime.votes && <span>{formatVotes(anime.votes)}</span>}
        </div>

        {/* Matched filters */}
        {anime.matched_filters?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.matched_filters.map(f => (
              <span
                key={f}
                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(201,165,90,0.07)", color: "rgba(201,165,90,0.55)", border: "1px solid rgba(201,165,90,0.12)" }}
              >
                ✓ {f}
              </span>
            ))}
          </div>
        )}

        {/* Summary on hover */}
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          {anime.summary && (
            <p
              className="text-[11px] leading-relaxed pt-1 pb-0.5 font-body"
              style={{ color: "rgba(232,221,208,0.32)" }}
            >
              {anime.summary}
            </p>
          )}
        </motion.div>

        {/* MAL link */}
        <a
          href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-all duration-200 pt-1"
          style={{ color: hovered ? accent : "rgba(232,221,208,0.18)" }}
        >
          <ExternalLink className="w-3 h-3" />
          view on myanimelist
        </a>
      </div>
    </motion.article>
  );
}
