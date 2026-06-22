"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { RecommendRequest, SiteMeta } from "@/lib/api";

const MOOD_ICONS: Record<string, string> = {
  hype: "⚡", cry: "🌧️", romance: "🌸", spooky: "🌑", chill: "☁️",
};

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
      setFilters(prev => ({
        ...prev,
        mood: null,
        genres: prev.genres.filter(g => !moodGenres.includes(g)),
      }));
    } else {
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

  const labelCls = "block font-display font-semibold text-sm uppercase tracking-widest mb-1";
  const labelColor = { color: "rgb(var(--text) / 0.75)" };
  const divider = { background: "rgb(var(--accent) / 0.1)" };

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-6">
      <motion.div
        className="surface rounded-3xl p-8 md:p-10 space-y-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >

        {/* ── Mood ── */}
        <div>
          <label className={labelCls} style={labelColor}>
            Mood
            <span className="ml-2 font-body normal-case font-normal text-xs" style={{ color: "rgb(var(--text) / 0.35)" }}>
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

          {filters.mood && MOOD_GENRES[filters.mood] && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[10px] mt-3 tracking-wide"
              style={{ color: "rgb(var(--accent) / 0.65)" }}
            >
              ✦ auto-selected: {MOOD_GENRES[filters.mood].join(", ")}
            </motion.p>
          )}
        </div>

        <div className="w-full h-px" style={divider} />

        {/* ── Genres ── */}
        <div>
          <label className={labelCls} style={labelColor}>
            <SlidersHorizontal className="inline w-4 h-4 mr-2" style={{ color: "rgb(var(--accent) / 0.7)" }} />
            Genres
            {filters.genres.length > 0 && (
              <span className="ml-2 font-mono normal-case font-normal text-[10px]" style={{ color: "rgb(var(--accent) / 0.65)" }}>
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
                  style={isMoodGenre ? { boxShadow: "0 0 10px rgb(var(--accent) / 0.25)" } : {}}
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
              className="mt-3 flex items-center gap-1 text-xs transition-colors font-mono hover:brightness-125"
              style={{ color: "rgb(var(--text) / 0.4)" }}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`} />
              {showAllGenres ? "Show fewer" : `Show ${meta.available_genres.length - 24} more genres`}
            </button>
          )}
        </div>

        <div className="w-full h-px" style={divider} />

        {/* ── Era + Rating ── */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block font-display font-semibold text-sm uppercase tracking-widest mb-4" style={labelColor}>
              Era
            </label>
            <div className="relative">
              <select
                value={filters.era}
                onChange={e => setFilters(prev => ({ ...prev, era: e.target.value }))}
                className="w-full appearance-none rounded-xl px-4 py-3 font-mono text-sm outline-none cursor-pointer transition-colors"
                style={{
                  color: "rgb(var(--text) / 0.8)",
                  border: "1px solid rgb(var(--accent) / 0.16)",
                  background: "rgb(var(--surface) / 0.6)",
                }}
              >
                {meta.eras.map(era => (
                  <option key={era} value={era} style={{ background: "#15161f", color: "#e8ecf7" }}>
                    {ERA_LABELS[era] ?? era}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgb(var(--accent) / 0.5)" }} />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between font-display font-semibold text-sm uppercase tracking-widest mb-4" style={labelColor}>
              Min Rating
              <span className="font-mono normal-case font-semibold text-base" style={{ color: "rgb(var(--accent))" }}>
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
            <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "rgb(var(--text) / 0.25)" }}>
              <span>{meta.min_rating.toFixed(1)}</span>
              <span>9.5</span>
            </div>
          </div>
        </div>

        {/* ── Summon ── */}
        <motion.button
          onClick={() => onSubmit(filters)}
          disabled={loading || (filters.genres.length === 0 && !filters.mood)}
          className="btn-summon w-full py-4 text-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileTap={{ scale: 0.97 }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Summoning…
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Summon ✦
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {filters.genres.length === 0 && !filters.mood && (
          <p className="text-center font-mono text-[10px]" style={{ color: "rgb(var(--accent) / 0.5)", marginTop: "-16px" }}>
            pick a mood or genre to charge the summon ✦
          </p>
        )}
      </motion.div>
    </section>
  );
}
