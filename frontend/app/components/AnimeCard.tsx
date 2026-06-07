"use client";

import { motion } from "framer-motion";
import { Star, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { AnimeResult } from "@/lib/api";

function getCardColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#e04f5f", "#5b7c99", "#d4a5a5", "#6b8c61", "#b47c9e"];
  return colors[Math.abs(hash) % colors.length];
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
  const [imgError, setImgError] = useState(false);
  const accentColor = getCardColor(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount = anime.total_filters ?? 0;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Colored top bar - human touch, not AI */}
        <div className="h-1" style={{ background: accentColor }} />

        <div className="p-5 space-y-3">
          {/* Rank number */}
          <div className="flex justify-between items-start">
            <span className="text-3xl font-black text-white/5 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-white/60">{matchedCount}/{totalCount}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-white/40">{anime.era}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-base leading-tight line-clamp-2">
            {anime.title}
          </h3>

          {/* Cluster tag */}
          {anime.cluster_label && (
            <span
              className="inline-block text-[10px] px-2 py-0.5 rounded font-mono"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
            >
              #{anime.cluster_label.split("/")[0]}
            </span>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {anime.genre.split(",").slice(0, 3).map(g => g.trim()).filter(Boolean).map(g => (
              <span
                key={g}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-mono"
              >
                {g.toLowerCase()}
              </span>
            ))}
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#e04f5f] stroke-[#e04f5f]" />
              {anime.rating.toFixed(1)}
            </span>
            {anime.predicted_rating > 0 && (
              <span className="font-mono text-white/30">
                🤖 {anime.predicted_rating.toFixed(1)}
              </span>
            )}
            {anime.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {anime.year}
              </span>
            )}
          </div>

          {/* Matched filters */}
          {anime.matched_filters?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {anime.matched_filters.slice(0, 3).map(f => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                  +{f}
                </span>
              ))}
            </div>
          )}

          {/* MAL Link */}
          <a
            href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono transition-colors pt-2 hover:text-[#e04f5f] text-white/30"
          >
            <ExternalLink className="w-3 h-3" />
            mal
          </a>
        </div>
      </div>
    </motion.div>
  );
}