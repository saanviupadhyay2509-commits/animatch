"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { RecommendRequest, SiteMeta } from "@/lib/api";

const MOOD_ICONS: Record<string, string> = {
  hype: "⚡", cry: "🌧️", romance: "🌸", spooky: "🌑", chill: "☁️",
};

// Genres each mood auto-selects — must match dataset exactly
const MOOD_GENRES: Record<string, string[]> = {
  hype    : ["Action", "Adventure", "Sport"],
  cry     : ["Drama", "Romance", "Family"],
  romance : ["Romance", "Drama", "Comedy"],
  spooky  : ["Horror", "Thriller", "Mystery"],
  chill   : ["Comedy", "Family"],
};

const ERA_LABELS: Record<string, string> = {
  any: "Any Era",
  classic: "Classic (pre-90s)",
  nineties: "Nineties",
  "two-thousands": "2000s",
  "twenty-tens": "2010s",
  recent: "Recent (2020s)",
};

interface Props {
  meta: SiteMeta;
  onSubmit: (req?: RecommendRequest) => void;
  loading: boolean;
  filters: RecommendRequest;
  setFilters: React.Dispatch<React.SetStateAction<RecommendRequest>>;
}

export function RecommendForm({ meta, onSubmit, loading, filters, setFilters }: Props) {
  const [showAllGenres, setShowAllGenres] = useState(false);

  const visibleGenres = showAllGenres
    ? meta.available_genres
    : meta.available_genres.slice(0, 24);

  function toggleGenre(genre: string) {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  }

  function toggleMood(mood: string) {
    const moodGenres = MOOD_GENRES[mood] ?? [];
    const isSelected = filters.mood === mood;

    if (isSelected) {
      // Deselect mood — remove its auto-added genres
      setFilters(prev => ({
        ...prev,
        mood: null,
        genres: prev.genres.filter(g => !moodGenres.includes(g)),
      }));
    } else {
      // Select mood — add its genres if not already present
      setFilters(prev => {
        const prevMoodGenres = MOOD_GENRES[prev.mood ?? ""] ?? [];
        const genresWithoutOldMood = prev.genres.filter(g => !prevMoodGenres.includes(g));
        const newGenres = [
          ...genresWithoutOldMood,
          ...moodGenres.filter(g => !genresWithoutOldMood.includes(g)),
        ];
        return { ...prev, mood, genres: newGenres };
      });
    }
  }

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
      <motion.div
        className="glass rounded-2xl p-8 md:p-10 space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >

        {/* ── Mood ── */}
        <div>
          <label className="block font-display font-semibold text-sm uppercase tracking-widest mb-1" style={{ color: "rgba(242,234,216,0.7)" }}>
            Mood
            <span className="ml-2 font-body normal-case font-normal text-xs" style={{ color: "rgba(242,234,216,0.3)" }}>
              (auto-selects matching genres)
            </span>
          </label>

          <div className="flex flex-wrap gap-3 mt-4">
            {meta.moods.map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`mood-chip ${filters.mood === mood ? "selected" : ""}`}
              >
                <span className="text-xl">{MOOD_ICONS[mood] ?? "✨"}</span>
                <span className="font-body capitalize font-medium">{mood}</span>
              </button>
            ))}
          </div>

          {/* Show which genres were auto-selected by mood */}
          {filters.mood && MOOD_GENRES[filters.mood] && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[10px] mt-3 tracking-wide"
              style={{ color: "rgba(232,184,75,0.55)" }}
            >
              ✦ auto-selected: {MOOD_GENRES[filters.mood].join(", ")}
            </motion.p>
          )}
        </div>

        <div className="w-full h-px" style={{ background: "rgba(232,184,75,0.08)" }} />

        {/* ── Genres ── */}
        <div>
          <label className="block font-display font-semibold text-sm uppercase tracking-widest mb-1" style={{ color: "rgba(242,234,216,0.7)" }}>
            <SlidersHorizontal className="inline w-4 h-4 mr-2" style={{ color: "rgba(232,184,75,0.6)" }} />
            Genres
            {filters.genres.length > 0 && (
              <span className="ml-2 font-mono normal-case font-normal text-[10px]" style={{ color: "rgba(232,184,75,0.55)" }}>
                · {filters.genres.length} selected
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2 mt-4">
            {visibleGenres.map(genre => {
              const isMoodGenre = filters.mood ? (MOOD_GENRES[filters.mood] ?? []).includes(genre) : false;
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`genre-pill ${filters.genres.includes(genre) ? "selected" : ""}`}
                  style={isMoodGenre ? { boxShadow: "0 0 8px rgba(232,184,75,0.2)" } : {}}
                >
                  {genre}
                  {isMoodGenre && <span className="ml-1 opacity-60">✦</span>}
                </button>
              );
            })}
          </div>

          {meta.available_genres.length > 24 && (
            <button
              onClick={() => setShowAllGenres(p => !p)}
              className="mt-3 flex items-center gap-1 text-xs transition-colors font-mono"
              style={{ color: "rgba(242,234,216,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(232,184,75,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,234,216,0.3)")}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`} />
              {showAllGenres ? "Show fewer" : `Show ${meta.available_genres.length - 24} more genres`}
            </button>
          )}
        </div>

        <div className="w-full h-px" style={{ background: "rgba(232,184,75,0.08)" }} />

        {/* ── Era + Rating ── */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block font-display font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: "rgba(242,234,216,0.7)" }}>
              Era
            </label>
            <div className="relative">
              <select
                value={filters.era}
                onChange={e => setFilters(prev => ({ ...prev, era: e.target.value }))}
                className="w-full appearance-none glass rounded-xl px-4 py-3 font-mono text-sm outline-none cursor-pointer transition-colors"
                style={{
                  color: "rgba(242,234,216,0.75)",
                  border: "1px solid rgba(232,184,75,0.14)",
                  background: "rgba(16,22,36,0.6)",
                }}
              >
                {meta.eras.map(era => (
                  <option key={era} value={era} style={{ background: "#141d2e" }}>
                    {ERA_LABELS[era] ?? era}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(232,184,75,0.4)" }} />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between font-display font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: "rgba(242,234,216,0.7)" }}>
              Min Rating
              <span className="font-mono normal-case font-semibold text-base" style={{ color: "#e8b84b" }}>
                {filters.min_rating.toFixed(1)} / 10
              </span>
            </label>
            <input
              type="range"
              min={meta.min_rating}
              max={9.5}
              step={0.5}
              value={filters.min_rating}
              onChange={e => setFilters(prev => ({ ...prev, min_rating: parseFloat(e.target.value) }))}
              className="mt-3"
            />
            <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "rgba(242,234,216,0.2)" }}>
              <span>{meta.min_rating.toFixed(1)}</span>
              <span>9.5</span>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <motion.button
          onClick={() => onSubmit(filters)}
          disabled={loading || (filters.genres.length === 0 && !filters.mood)}
          className="btn-glow w-full py-4 rounded-xl font-display font-bold text-white text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding your anime...
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Find My Anime
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Hint when nothing selected */}
        {filters.genres.length === 0 && !filters.mood && (
          <p className="text-center font-mono text-[10px]" style={{ color: "rgba(232,184,75,0.3)", marginTop: "-16px" }}>
            select a mood or genre to get started
          </p>
        )}
      </motion.div>
    </section>
  );
}
