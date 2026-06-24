"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Bookmark, Clock, ExternalLink, ChevronDown, Check, Sparkles } from "lucide-react";
import type { AnimeResult } from "@/lib/api";
import { useFavorites } from "../lib/useFavorites";
import { useWatchLater } from "../lib/useWatchLater";

function pct(x: number): number {
  if (!isFinite(x) || x <= 0) return 0;
  const v = x <= 1 ? x * 100 : x;
  return Math.max(0, Math.min(100, Math.round(v)));
}
function confidenceOf(a: AnimeResult): { label: string; value: number } {
  const base = a.match_score > 0 ? a.match_score : a.similarity;
  const v = pct(base);
  if (v >= 78) return { label: "High", value: v };
  if (v >= 50) return { label: "Medium", value: v };
  return { label: "Exploratory", value: Math.max(v, 28) };
}

// Deterministic charcoal→indigo poster gradient per title.
function posterStyle(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  const a = Math.abs(h) % 50 + 215; // hue near indigo/blue
  return {
    background: `linear-gradient(150deg, hsl(${a} 30% 16%), hsl(${(a + 30) % 360} 24% 10%))`,
  };
}

interface Props { anime: AnimeResult; index: number; }

export function ResultCard({ anime, index }: Props) {
  const [open, setOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isWatchLater, toggleWatchLater } = useWatchLater();
  const saved = isFavorite(anime.title);
  const later = isWatchLater(anime.title);

  const match = pct(anime.match_score > 0 ? anime.match_score : anime.similarity);
  const sim = pct(anime.similarity);
  const conf = confidenceOf(anime);
  const genres = anime.genre.split(",").map(g => g.trim()).filter(Boolean);

  return (
    <motion.article
      className="card card-hover overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Poster */}
      <div className="relative h-[150px] flex items-end p-3" style={posterStyle(anime.title)}>
        <span className="absolute inset-0 grid place-items-center font-serif select-none pointer-events-none"
          style={{ fontSize: "4.5rem", color: "rgba(255,255,255,0.06)" }}>
          {anime.title.charAt(0)}
        </span>
        <span className="relative inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
          style={{ background: "rgba(10,10,12,0.7)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid var(--border)" }}>
          <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} /> {match}% match
        </span>
        {anime.rating > 0 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium tnum"
            style={{ background: "rgba(10,10,12,0.7)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid var(--border)" }}>
            <Star className="w-3 h-3" style={{ fill: "var(--warn)", stroke: "var(--warn)" }} /> {anime.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display font-600 leading-snug line-clamp-2" style={{ fontWeight: 600, fontSize: "0.98rem", color: "var(--text)" }}>
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[12px] tnum" style={{ color: "var(--text-subtle)" }}>
            {anime.year && <span>{anime.year}</span>}
            {anime.cluster_label && <><span>·</span><span className="truncate">{anime.cluster_label}</span></>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {genres.slice(0, 3).map(g => <span key={g} className="tag">{g}</span>)}
        </div>

        {anime.summary && (
          <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {anime.summary}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <button onClick={() => toggleFavorite(anime)} className="btn btn-secondary flex-1 py-2 text-[12.5px]"
            style={saved ? { borderColor: "var(--accent-line)", color: "#c7c9ff", background: "var(--accent-soft)" } : undefined}>
            <Bookmark className="w-3.5 h-3.5" style={{ fill: saved ? "currentColor" : "transparent" }} />
            {saved ? "Saved" : "Save"}
          </button>
          <button onClick={() => toggleWatchLater(anime)} className="btn btn-ghost py-2 px-2.5" title="Watch later"
            style={later ? { color: "var(--accent)" } : undefined}>
            <Clock className="w-4 h-4" />
          </button>
          <a href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost py-2 px-2.5" title="Details">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Why this recommendation */}
        <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-[12.5px] pt-1"
          style={{ color: "var(--text-muted)" }}>
          <span className="inline-flex items-center gap-1.5">✨ Why this recommendation?</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
              <div className="rounded-lg p-3 space-y-3 text-[12.5px]" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                {(anime.matched_filters?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {anime.matched_filters.map(f => (
                      <span key={f} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px]"
                        style={{ background: "rgba(52,211,153,0.12)", color: "#6ee7b7" }}>
                        <Check className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                )}
                <Row label="Similarity score" value={`${sim}%`} meter={sim} />
                <Row label="Confidence" value={conf.label} meter={conf.value} />
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-subtle)" }}>Cluster</span>
                  <span style={{ color: "var(--text)" }}>{anime.cluster_label || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-subtle)" }}>Matched filters</span>
                  <span className="tnum" style={{ color: "var(--text)" }}>{anime.matched_filters?.length ?? 0}/{anime.total_filters ?? 0}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function Row({ label, value, meter }: { label: string; value: string; meter: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ color: "var(--text-subtle)" }}>{label}</span>
        <span style={{ color: "var(--text)" }}>{value}</span>
      </div>
      <div className="meter"><span style={{ width: `${meter}%` }} /></div>
    </div>
  );
}
