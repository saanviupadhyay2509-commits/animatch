"use client";

import { motion } from "framer-motion";
import { Star, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";
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

interface Props { anime: AnimeResult; index: number; }

export function AnimeCard({ anime, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const accent = getAccent(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters   ?? 0;

  return (
    <motion.article
      className="glass glass-hover rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div className="h-[2px]" style={{ background: accent }} />

      <div className="p-5 space-y-3">

        {/* Rank + meta row */}
        <div className="flex items-start justify-between">
          <span
            className="font-mono font-black select-none"
            style={{ fontSize: "2.2rem", lineHeight: 1, color: "rgba(255,255,255,0.04)" }}
          >
            {String(index + 2).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>{matchedCount}/{totalCount} matched</span>
            <span>·</span>
            <span>{anime.era}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-[0.95rem] leading-tight line-clamp-2">
          {anime.title}
        </h3>

        {/* Cluster label */}
        {anime.cluster_label && (
          <span
            className="inline-block font-mono text-[9px] px-2 py-0.5 rounded"
            style={{
              background: `${accent}12`,
              border: `1px solid ${accent}28`,
              color: accent,
              letterSpacing: "0.04em",
            }}
          >
            {anime.cluster_label}
          </span>
        )}

        {/* Genre pills */}
        <div className="flex flex-wrap gap-1.5">
          {anime.genre.split(",").slice(0, 3).map(g => g.trim()).filter(Boolean).map(g => (
            <span
              key={g}
              className="font-mono text-[9px] px-2 py-0.5 rounded"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.03em",
              }}
            >
              {g.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>
          {anime.rating > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Star className="w-3 h-3" style={{ fill: accent, stroke: accent }} />
              {anime.rating.toFixed(1)}
            </span>
          )}
          {anime.year && (
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              {anime.year}
            </span>
          )}
          {anime.votes && (
            <span className="font-mono">{formatVotes(anime.votes)} votes</span>
          )}
        </div>

        {/* Matched filters */}
        {anime.matched_filters?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {anime.matched_filters.map(f => (
              <span
                key={f}
                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}
              >
                +{f}
              </span>
            ))}
          </div>
        )}

        {/* Summary — shown on hover */}
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          {anime.summary && (
            <p className="text-[11px] leading-relaxed pt-1 pb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {anime.summary}
            </p>
          )}
        </motion.div>

        {/* MAL link */}
        <a
          href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-colors duration-200 pt-1"
          style={{ color: hovered ? accent : "rgba(255,255,255,0.2)" }}
        >
          <ExternalLink className="w-3 h-3" />
          myanimelist
        </a>
      </div>
    </motion.article>
  );
}
