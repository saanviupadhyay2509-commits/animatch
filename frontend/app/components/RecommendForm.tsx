"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { RecommendRequest, SiteMeta } from "@/lib/api";

const MOOD_ICONS: Record<string, string> = {
  hype: "⚡",
  cry: "🌧️",
  romance: "🌸",
  spooky: "🌑",
  chill: "☁️",
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
  onSubmit: (req: RecommendRequest) => void;
  loading: boolean;
}

export function RecommendForm({ meta, onSubmit, loading }: Props) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Action"]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState("any");
  const [minRating, setMinRating] = useState(6.5);
  const [showAllGenres, setShowAllGenres] = useState(false);

  const visibleGenres = showAllGenres ? meta.available_genres : meta.available_genres.slice(0, 24);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }

  function handleSubmit() {
    if (selectedGenres.length === 0) return;
    onSubmit({
      genres: selectedGenres,
      min_rating: minRating,
      era: selectedEra,
      mood: selectedMood,
      top_n: 6,
    });
  }

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
      <motion.div
        className="glass rounded-2xl p-8 md:p-10 space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {/* Genres */}
        <div>
          <label className="block font-display font-semibold text-white/80 text-sm uppercase tracking-widest mb-4">
            <SlidersHorizontal className="inline w-4 h-4 mr-2 text-purple-400" />
            Genres
            {selectedGenres.length > 0 && (
              <span className="ml-2 text-purple-400 normal-case font-body">
                · {selectedGenres.join(", ")}
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2">
            {visibleGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`genre-pill ${selectedGenres.includes(genre) ? "selected" : ""}`}
              >
                {genre}
              </button>
            ))}
          </div>

          {meta.available_genres.length > 24 && (
            <button
              onClick={() => setShowAllGenres((p) => !p)}
              className="mt-3 flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors font-body"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`}
              />
              {showAllGenres ? "Show fewer" : `Show ${meta.available_genres.length - 24} more genres`}
            </button>
          )}
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Mood */}
        <div>
          <label className="block font-display font-semibold text-white/80 text-sm uppercase tracking-widest mb-4">
            Mood
            <span className="ml-2 font-body normal-case text-white/30 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {meta.moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood((p) => (p === mood ? null : mood))}
                className={`mood-chip ${selectedMood === mood ? "selected" : ""}`}
              >
                <span className="text-xl">{MOOD_ICONS[mood] ?? "✨"}</span>
                <span className="font-body capitalize font-medium">{mood}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Era + Rating in a grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Era */}
          <div>
            <label className="block font-display font-semibold text-white/80 text-sm uppercase tracking-widest mb-4">
              Era
            </label>
            <div className="relative">
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className="w-full appearance-none glass rounded-xl px-4 py-3 font-body text-sm text-white/80 outline-none cursor-pointer
                  border border-white/10 hover:border-purple-500/40 transition-colors focus:border-purple-500/60"
              >
                {meta.eras.map((era) => (
                  <option key={era} value={era} className="bg-[#16162a]">
                    {ERA_LABELS[era] ?? era}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <label className="flex items-center justify-between font-display font-semibold text-white/80 text-sm uppercase tracking-widest mb-4">
              Min Rating
              <span className="font-body normal-case text-purple-300 font-semibold text-base">
                {minRating.toFixed(1)} / 10
              </span>
            </label>
            <input
              type="range"
              min={meta.min_rating}
              max={9.5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-white/25 font-body mt-1">
              <span>{meta.min_rating.toFixed(1)}</span>
              <span>9.5</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={loading || selectedGenres.length === 0}
          className="btn-glow w-full py-4 rounded-xl font-display font-bold text-white text-base
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <svg
                  className="animate-spin w-5 h-5 text-white/70"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
                Finding your anime…
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Find My Anime
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </section>
  );
}
