"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import type { AnimeResult } from "@/lib/api";
import { genreClass } from "../lib/genreColors";
import { rarityOf } from "../lib/rarity";
import { useFavorites } from "../lib/useFavorites";
import { birdSay } from "../lib/birdBus";

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
}

export function FeaturedSummon({ anime }: { anime: AnimeResult }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(anime.title);
  const r = rarityOf(anime);

  function onMove(e: React.MouseEvent) {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 6, ry: (px - 0.5) * 6 });
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  return (
    <motion.div style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 26, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="mb-6"
    >
      <div
        ref={cardRef}
        className="gacha relative w-full overflow-hidden"
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        style={{ minHeight: 250, transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: "transform 0.12s ease-out" }}
      >
        <div className="gacha-holo" />
        <div className="gacha-sheen" />

        {/* burst rays behind */}
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{
          background: "repeating-conic-gradient(from 0deg at 80% 30%, rgb(var(--accent) / 0.12) 0deg 8deg, transparent 8deg 16deg)",
          maskImage: "radial-gradient(circle at 80% 30%, black, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle at 80% 30%, black, transparent 60%)",
        }} />

        <div className={`flex items-center justify-between px-5 py-2 ${r.ribbon}`}>
          <span className="rarity text-sm" style={{ color: "#fff", textShadow: "0 1px 4px rgb(0 0 0 / 0.3)" }}>★ {r.tier} ★</span>
          <span className="font-display text-[11px]" style={{ color: "rgb(0 0 0 / 0.6)" }}>TOP SUMMON · {r.label}</span>
        </div>

        <div className="relative p-7 md:p-9">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4" style={{ fill: i < r.stars ? "rgb(var(--accent))" : "transparent", stroke: "rgb(var(--accent))" }} />
              ))}
            </span>
            <button
              onClick={() => { const will = !favorited; toggleFavorite(anime); birdSay(will ? "favorite_add" : "favorite_remove"); }}
              className="ml-auto transition-transform duration-150 hover:scale-125"
              aria-label={favorited ? "Remove from collection" : "Add to collection"}
            >
              <Sparkles className="w-5 h-5" style={{ fill: favorited ? "rgb(var(--accent))" : "transparent", stroke: "rgb(var(--accent))" }} />
            </button>
          </div>

          <h2 className="font-display gradient-text glow-text mb-3"
            style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)", lineHeight: 1.05, maxWidth: 620 }}>
            {anime.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {anime.genre.split(",").slice(0, 5).map(g => g.trim()).filter(Boolean).map(g => (
              <span key={g} className={`genre-badge ${genreClass(g)}`}>{g.toLowerCase()}</span>
            ))}
          </div>

          {anime.summary && (
            <p className="font-body text-sm leading-relaxed mb-5" style={{ color: "rgb(var(--text) / 0.5)", maxWidth: 540 }}>
              {anime.summary.length > 160 ? anime.summary.slice(0, 160) + "…" : anime.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-5 font-mono text-xs" style={{ color: "rgb(var(--text) / 0.45)" }}>
              {anime.rating > 0 && (
                <span className="flex items-center gap-1.5" style={{ color: "rgb(var(--accent))" }}>
                  ★ <span style={{ color: "rgb(var(--text) / 0.85)" }}>{anime.rating.toFixed(1)}</span>
                </span>
              )}
              {anime.year && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{anime.year}</span>}
              {anime.votes && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{formatVotes(anime.votes)}</span>}
            </div>

            <a href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[11px] px-3.5 py-2 rounded-full transition-all hover:brightness-110"
              style={{ background: "rgb(var(--accent) / 0.18)", border: "1.5px solid rgb(var(--accent) / 0.4)", color: "rgb(var(--accent))" }}>
              <ExternalLink className="w-3 h-3" /> view on MAL
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
