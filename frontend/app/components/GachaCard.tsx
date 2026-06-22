"use client";

import { motion } from "framer-motion";
import { Star, Calendar, ExternalLink, Sparkles } from "lucide-react";
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

function StarRow({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3 h-3" style={{
          fill: i < n ? "rgb(var(--accent))" : "transparent",
          stroke: i < n ? "rgb(var(--accent))" : "rgb(var(--text) / 0.25)",
        }} />
      ))}
    </span>
  );
}

interface Props { anime: AnimeResult; index: number; }

export function GachaCard({ anime, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(anime.title);
  const r = rarityOf(anime);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount = anime.total_filters ?? 0;

  function onMove(e: React.MouseEvent) {
    const el = cardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 10, ry: (px - 0.5) * 10 });
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function onLeave() { setTilt({ rx: 0, ry: 0 }); setHovered(false); }

  return (
    <motion.div
      style={{ perspective: 900 }}
      initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: (index % 3) * 0.08 }}
    >
      <div
        ref={cardRef}
        className="gacha"
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.12s ease-out",
        }}
      >
        <div className="gacha-holo" />
        <div className="gacha-sheen" />

        {/* Rarity ribbon */}
        <div className={`flex items-center justify-between px-4 py-1.5 ${r.ribbon}`}>
          <span className={`rarity text-[11px] ${r.textClass}`} style={{ color: "#fff" }}>{r.tier}</span>
          <span className="font-mono text-[9px] font-bold" style={{ color: "rgb(0 0 0 / 0.55)" }}>{r.label}</span>
        </div>

        <div className="relative p-5 space-y-3">
          {/* rank watermark */}
          <span className="absolute right-4 top-2 font-display select-none pointer-events-none"
            style={{ fontSize: "2.6rem", lineHeight: 1, color: "rgb(var(--accent) / 0.1)" }}>
            {String(index + 2).padStart(2, "0")}
          </span>

          <div className="flex items-center justify-between pr-10">
            <StarRow n={r.stars} />
            <button
              onClick={() => { const will = !favorited; toggleFavorite(anime); birdSay(will ? "favorite_add" : "favorite_remove"); }}
              className="transition-transform duration-150 hover:scale-125"
              aria-label={favorited ? "Remove from collection" : "Add to collection"}
            >
              <Sparkles className="w-4 h-4" style={{ fill: favorited ? "rgb(var(--accent))" : "transparent", stroke: "rgb(var(--accent))" }} />
            </button>
          </div>

          <h3 className="font-display leading-tight line-clamp-2" style={{ fontSize: "1.05rem", color: "rgb(var(--text))" }}>
            {anime.title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {anime.genre.split(",").slice(0, 3).map(g => g.trim()).filter(Boolean).map(g => (
              <span key={g} className={`genre-badge ${genreClass(g)}`}>{g.toLowerCase()}</span>
            ))}
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: "rgb(var(--text) / 0.4)" }}>
            {anime.rating > 0 && (
              <span className="flex items-center gap-1" style={{ color: "rgb(var(--accent) / 0.9)" }}>
                ★ <span style={{ color: "rgb(var(--text) / 0.75)" }}>{anime.rating.toFixed(1)}</span>
              </span>
            )}
            {anime.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{anime.year}</span>}
            {anime.votes && <span>{formatVotes(anime.votes)}</span>}
            {totalCount > 0 && <span style={{ color: "rgb(var(--accent) / 0.7)" }}>{matchedCount}/{totalCount}✓</span>}
          </div>

          <motion.div initial={false} animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
            {anime.summary && (
              <p className="text-[11px] leading-relaxed pt-1 font-body" style={{ color: "rgb(var(--text) / 0.45)" }}>{anime.summary}</p>
            )}
          </motion.div>

          <a
            href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] transition-all duration-200"
            style={{ color: hovered ? "rgb(var(--accent))" : "rgb(var(--text) / 0.3)" }}
          >
            <ExternalLink className="w-3 h-3" /> view on myanimelist
          </a>
        </div>
      </div>
    </motion.div>
  );
}
