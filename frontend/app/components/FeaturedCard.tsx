"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink, Heart } from "lucide-react";
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

export function FeaturedCard({ anime }: { anime: AnimeResult }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters   ?? 0;

  return (
    <motion.div
      className="relative w-full rounded-2xl overflow-hidden mb-5 surface"
      style={{ minHeight: "240px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2) / 0.5), transparent)" }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 82% 25%, rgb(var(--accent) / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 8% 85%, rgb(var(--accent-2) / 0.08) 0%, transparent 45%)"
      }} />

      <div className="relative p-8 md:p-10">

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded"
            style={{ background: "rgb(var(--accent) / 0.14)", border: "1px solid rgb(var(--accent) / 0.35)", color: "rgb(var(--accent))" }}>
            ✦ top pick
          </span>
          <span className="font-mono text-[10px]" style={{ color: "rgb(var(--text) / 0.3)" }}>
            {matchedCount}/{totalCount} matched
          </span>
          <button
            onClick={() => {
              const willFavorite = !favorited;
              toggleFavorite(anime);
              birdSay(willFavorite ? "favorite_add" : "favorite_remove");
            }}
            className="ml-auto transition-transform duration-150 hover:scale-125"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-4 h-4" style={{ fill: favorited ? "rgb(var(--accent))" : "transparent", stroke: favorited ? "rgb(var(--accent))" : "rgb(var(--text) / 0.35)" }} />
          </button>
        </div>

        <h2
          className="font-display font-bold mb-3 gradient-text"
          style={{ fontSize: "clamp(1.7rem, 4vw, 2.8rem)", lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: "600px" }}
        >
          {anime.title}
        </h2>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {anime.genre.split(",").slice(0, 5).map(g => g.trim()).filter(Boolean).map(g => (
            <span key={g} className={`genre-badge ${genreClass(g)}`}>{g.toLowerCase()}</span>
          ))}
        </div>

        {anime.summary && (
          <p className="font-body text-sm leading-relaxed mb-5" style={{ color: "rgb(var(--text) / 0.45)", maxWidth: "520px" }}>
            {anime.summary.length > 155 ? anime.summary.slice(0, 155) + "…" : anime.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-5 font-mono text-xs" style={{ color: "rgb(var(--text) / 0.4)" }}>
            {anime.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" style={{ fill: "rgb(var(--accent))", stroke: "rgb(var(--accent))" }} />
                <span style={{ color: "rgb(var(--text) / 0.8)" }}>{anime.rating.toFixed(1)}</span>
              </span>
            )}
            {anime.year && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{anime.year}</span>}
            {anime.votes && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{formatVotes(anime.votes)}</span>}
          </div>

          <a
            href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
            style={{ background: "rgb(var(--accent) / 0.16)", border: "1px solid rgb(var(--accent) / 0.38)", color: "rgb(var(--accent))" }}
          >
            <ExternalLink className="w-3 h-3" />
            view on MAL
          </a>
        </div>
      </div>

      <div className="absolute right-8 bottom-2 font-display font-bold select-none pointer-events-none"
        style={{ fontSize: "clamp(5rem, 13vw, 9rem)", lineHeight: 1, color: "rgb(var(--accent) / 0.06)", letterSpacing: "-0.05em" }}>
        01
      </div>
    </motion.div>
  );
}
