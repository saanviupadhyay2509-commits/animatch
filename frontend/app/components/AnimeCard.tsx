"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, TrendingUp } from "lucide-react";
import type { AnimeResult } from "@/lib/api";

// Deterministic gradient per title (so each card looks unique but consistent)
const GRADIENTS = [
  "from-purple-900/60 to-blue-900/40",
  "from-pink-900/60 to-purple-900/40",
  "from-blue-900/60 to-cyan-900/40",
  "from-violet-900/60 to-purple-900/40",
  "from-fuchsia-900/60 to-pink-900/40",
  "from-indigo-900/60 to-violet-900/40",
];

function getGradient(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
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
  const gradient = getGradient(anime.title);
  const scorePercent = Math.round(anime.match_score * 100);

  return (
    <motion.article
      className="glass glass-hover rounded-2xl overflow-hidden relative group"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Card gradient header */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative flex items-end p-4`}>
        {/* Score badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-full px-2.5 py-1 text-xs font-body font-semibold text-white/90">
          <TrendingUp className="w-3 h-3 text-purple-400" />
          {scorePercent}% match
        </div>

        {/* Rank number */}
        <span
          className="font-display font-bold text-white/10 select-none pointer-events-none"
          style={{ fontSize: "4.5rem", lineHeight: 1, position: "absolute", right: "1rem", bottom: "-0.5rem" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2">
          {anime.title}
        </h3>

        {/* Genre pills */}
        <div className="flex flex-wrap gap-1.5">
          {anime.genre
            .split(",")
            .slice(0, 3)
            .map((g) => g.trim())
            .filter(Boolean)
            .map((g) => (
              <span
                key={g}
                className="text-[10px] px-2 py-0.5 rounded-full font-body font-semibold uppercase tracking-wide
                  bg-purple-500/10 border border-purple-500/20 text-purple-300"
              >
                {g}
              </span>
            ))}
        </div>

        {/* Stats row */}
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

        {/* Match score bar */}
        <div>
          <div className="flex justify-between text-[10px] text-white/25 font-body mb-1">
            <span>Match strength</span>
            <span>{scorePercent}%</span>
          </div>
          <div className="score-bar">
            <motion.div
              className="score-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 1, delay: index * 0.08 + 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Summary snippet */}
        {anime.summary && (
          <p className="text-xs text-white/35 font-body line-clamp-2 leading-relaxed pt-1">
            {anime.summary}
          </p>
        )}
      </div>
    </motion.article>
  );
}
