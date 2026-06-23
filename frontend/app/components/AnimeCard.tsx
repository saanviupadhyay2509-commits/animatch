"use client";

import { motion } from "framer-motion";
import { Star, Calendar, ExternalLink, Heart } from "lucide-react";
import { useState } from "react";
import type { AnimeResult } from "@/lib/api";
import { genreClass } from "../lib/genreColors";
import { useFavorites } from "../lib/useFavorites";
import { birdSay } from "../lib/birdBus";

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
}

interface Props { anime: AnimeResult; index: number; }

export function AnimeCard({ anime, index }: Props) {
  const [hovered, setHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters   ?? 0;

  return (
    <motion.article
      className="surface surface-hover rounded-2xl overflow-hidden cursor-pointer relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, rgb(var(--accent)), transparent)" }} />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: "radial-gradient(ellipse at top left, rgb(var(--accent) / 0.06) 0%, transparent 55%)" }}
      />

      <div className="relative p-5 space-y-3">

        <div className="flex items-start justify-between">
          <span className="font-display font-bold select-none" style={{ fontSize: "2.6rem", lineHeight: 1, color: "rgb(var(--accent) / 0.1)" }}>
            {String(index + 2).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]" style={{ color: "rgb(var(--text) / 0.3)" }}>
            <span style={{ color: "rgb(var(--accent) / 0.8)" }}>{matchedCount}/{totalCount}</span>
            <span style={{ color: "rgb(var(--accent) / 0.3)" }}>·</span>
            <span>{anime.era}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const willFavorite = !favorited;
                toggleFavorite(anime);
                birdSay(willFavorite ? "favorite_add" : "favorite_remove");
              }}
              className="ml-1 transition-transform duration-150 hover:scale-125"
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className="w-3.5 h-3.5" style={{ fill: favorited ? "rgb(var(--accent))" : "transparent", stroke: favorited ? "rgb(var(--accent))" : "rgb(var(--text) / 0.3)" }} />
            </button>
          </div>
        </div>

        <h3 className="font-display font-bold leading-tight line-clamp-2" style={{ fontSize: "1.05rem", color: "rgb(var(--text))" }}>
          {anime.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {anime.genre.split(",").slice(0, 3).map(g => g.trim()).filter(Boolean).map(g => (
            <span key={g} className={`genre-badge ${genreClass(g)}`}>{g.toLowerCase()}</span>
          ))}
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: "rgb(var(--text) / 0.32)" }}>
          {anime.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" style={{ fill: "rgb(var(--accent))", stroke: "rgb(var(--accent))" }} />
              <span style={{ color: "rgb(var(--text) / 0.7)" }}>{anime.rating.toFixed(1)}</span>
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

        {anime.matched_filters?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.matched_filters.map(f => (
              <span key={f} className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: "rgb(var(--accent) / 0.08)", border: "1px solid rgb(var(--accent) / 0.18)", color: "rgb(var(--accent) / 0.7)" }}>
                ✓ {f}
              </span>
            ))}
          </div>
        )}

        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          {anime.summary && (
            <p className="text-[11px] leading-relaxed pt-1 font-body" style={{ color: "rgb(var(--text) / 0.4)" }}>
              {anime.summary}
            </p>
          )}
        </motion.div>

        <a
          href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-all duration-200 pt-1"
          style={{ color: hovered ? "rgb(var(--accent))" : "rgb(var(--text) / 0.25)" }}
        >
          <ExternalLink className="w-3 h-3" />
          view on myanimelist
        </a>
      </div>
    </motion.article>
  );
}
