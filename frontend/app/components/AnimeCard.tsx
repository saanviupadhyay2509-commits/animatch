"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, TrendingUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { AnimeResult } from "@/lib/api";

const GRADIENTS = [
  "from-purple-900/70 to-blue-900/50",
  "from-pink-900/70 to-purple-900/50",
  "from-blue-900/70 to-cyan-900/50",
  "from-violet-900/70 to-purple-900/50",
  "from-fuchsia-900/70 to-pink-900/50",
  "from-indigo-900/70 to-violet-900/50",
];

const GLOW_COLORS = [
  "rgba(124,106,247,0.3)",
  "rgba(244,114,182,0.3)",
  "rgba(96,165,250,0.3)",
  "rgba(167,139,250,0.3)",
  "rgba(232,121,249,0.3)",
  "rgba(99,102,241,0.3)",
];

function getGradient(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return { grad: GRADIENTS[Math.abs(hash) % GRADIENTS.length], glow: GLOW_COLORS[Math.abs(hash) % GLOW_COLORS.length] };
}

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
}

interface Props {
  anime: AnimeResult;
  index: number;
}

export function AnimeCard({ anime, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const { grad, glow } = getGradient(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters ?? 0;
  const filtersLabel = `${matchedCount}/${totalCount} matched`;

  return (
    <motion.article
      className="glass rounded-2xl overflow-hidden relative cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        transition: "box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 30px 80px ${glow}, 0 0 0 1px rgba(255,255,255,0.08)` : "none",
        borderColor: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Card header */}
      <div
        className={`bg-gradient-to-br ${grad} relative flex items-end p-4`}
        style={{
          height: hovered ? "120px" : "112px",
          transition: "height 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-full px-2.5 py-1 text-[10px] font-body font-semibold text-white/80">
          <TrendingUp className="w-3 h-3 text-purple-400" />
          {filtersLabel}
        </div>
        <span
          className="font-display font-bold text-white/10 select-none pointer-events-none"
          style={{ fontSize: "4.5rem", lineHeight: 1, position: "absolute", right: "1rem", bottom: "-0.5rem" }}
        >
          {String(index + 2).padStart(2, "0")}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2">
          {anime.title}
        </h3>

        {/* Cluster label */}
        {anime.cluster_label && (
          <span
            className="inline-block text-[10px] px-2 py-0.5 rounded-full font-body font-semibold tracking-wide"
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.2)",
              color: "#93c5fd",
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
              className="text-[10px] px-2 py-0.5 rounded-full font-body font-semibold uppercase tracking-wide bg-purple-500/10 border border-purple-500/20 text-purple-300"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-white/45 font-body">
          {anime.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400/80" />
              {anime.rating.toFixed(1)}
            </span>
          )}
          {anime.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {anime.year}
            </span>
          )}
          {anime.votes && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatVotes(anime.votes)}
            </span>
          )}
        </div>

        {/* Filter match tags */}
        {anime.matched_filters?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {anime.matched_filters.map(f => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full font-body font-semibold uppercase tracking-wide bg-green-500/10 border border-green-500/20 text-green-300"
              >
                ✓ {f}
              </span>
            ))}
          </div>
        )}

        {/* Expanded summary on hover */}
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          {anime.summary && (
            <p className="text-xs text-white/40 font-body leading-relaxed pt-2 pb-1">
              {anime.summary}
            </p>
          )}
        </motion.div>

        {/* MAL link */}
        <a
          href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold transition-colors duration-200 pt-1"
          style={{ color: hovered ? "rgba(192,132,252,1)" : "rgba(124,106,247,0.7)" }}
        >
          <ExternalLink className="w-3 h-3" />
          View on MyAnimeList
        </a>
      </div>
    </motion.article>
  );
}
