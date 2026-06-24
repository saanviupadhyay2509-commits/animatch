"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Sparkles } from "lucide-react";
import type { RecommendRequest, SiteMeta } from "@/lib/api";

const EXAMPLES = [
  "Something emotional with amazing world-building",
  "Dark mystery with psychological twists",
  "Light-hearted fantasy after a stressful day",
  "Action anime with strong female leads",
];

const MOOD_LABELS: Record<string, string> = {
  hype: "Hype", cry: "Emotional", romance: "Romance", spooky: "Dark", chill: "Chill",
};

const MOOD_GENRES: Record<string, string[]> = {
  hype: ["Action", "Adventure", "Sport"],
  cry: ["Drama", "Romance", "Family"],
  romance: ["Romance", "Drama", "Comedy"],
  spooky: ["Horror", "Thriller", "Mystery"],
  chill: ["Comedy", "Family"],
};

const ERA_LABELS: Record<string, string> = {
  any: "Any era", classic: "Classic (pre-90s)", nineties: "Nineties",
  "two-thousands": "2000s", "twenty-tens": "2010s", recent: "Recent (2020s)",
};

interface Props {
  meta: SiteMeta;
  query: string;
  setQuery: (q: string) => void;
  filters: RecommendRequest;
  setFilters: React.Dispatch<React.SetStateAction<RecommendRequest>>;
  onGenerate: () => void;
  loading: boolean;
}

export function SearchPanel({ meta, query, setQuery, filters, setFilters, onGenerate, loading }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);

  const visibleGenres = showAllGenres ? meta.available_genres : meta.available_genres.slice(0, 14);
  const filterCount = filters.genres.length + (filters.mood ? 1 : 0) + (filters.era !== "any" ? 1 : 0);

  function toggleGenre(g: string) {
    setFilters(p => ({ ...p, genres: p.genres.includes(g) ? p.genres.filter(x => x !== g) : [...p.genres, g] }));
  }
  function toggleMood(mood: string) {
    const mg = MOOD_GENRES[mood] ?? [];
    setFilters(p => {
      if (p.mood === mood) return { ...p, mood: null, genres: p.genres.filter(g => !mg.includes(g)) };
      const prevMg = MOOD_GENRES[p.mood ?? ""] ?? [];
      const base = p.genres.filter(g => !prevMg.includes(g));
      return { ...p, mood, genres: [...base, ...mg.filter(g => !base.includes(g))] };
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-6">
      <div className="card" style={{ padding: "0.5rem 0.5rem 0.5rem 0.5rem", boxShadow: "var(--shadow)" }}>
        {/* Search row */}
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 ml-3 shrink-0" style={{ color: "var(--text-subtle)" }} />
          <input
            id="anim-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onGenerate(); }}
            placeholder="Describe the anime you're in the mood for…"
            className="flex-1 bg-transparent outline-none py-3 text-[15px]"
            style={{ color: "var(--text)" }}
          />
          <button onClick={onGenerate} disabled={loading} className="btn btn-primary px-4 py-2.5 m-0.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Generating</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => setQuery(ex)} className="chip text-[12.5px]">
            {ex}
          </button>
        ))}
      </div>

      {/* Filters toggle */}
      <div className="flex items-center justify-center mt-5">
        <button onClick={() => setShowFilters(s => !s)} className="btn btn-ghost text-[13px]">
          <SlidersHorizontal className="w-4 h-4" />
          Smart filters
          {filterCount > 0 && (
            <span className="text-[11px] tnum px-1.5 py-0.5 rounded-md ml-0.5" style={{ background: "var(--accent-soft)", color: "#c7c9ff" }}>
              {filterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card rise mt-3 p-5 space-y-5">
          {/* Mood */}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Mood</p>
            <div className="flex flex-wrap gap-2">
              {meta.moods.map(m => (
                <button key={m} onClick={() => toggleMood(m)} className="chip" data-active={filters.mood === m}>
                  {MOOD_LABELS[m] ?? m}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>
              Genre {filters.genres.length > 0 && <span style={{ color: "var(--accent)" }}>· {filters.genres.length}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleGenres.map(g => (
                <button key={g} onClick={() => toggleGenre(g)} className="chip" data-active={filters.genres.includes(g)}>
                  {g}
                </button>
              ))}
              {meta.available_genres.length > 14 && (
                <button onClick={() => setShowAllGenres(s => !s)} className="chip" style={{ color: "var(--accent)" }}>
                  {showAllGenres ? "Show less" : `+${meta.available_genres.length - 14} more`}
                </button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 pt-1">
            {/* Era */}
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle)" }}>Era</p>
              <div className="relative">
                <select value={filters.era} onChange={e => setFilters(p => ({ ...p, era: e.target.value }))} className="input py-2.5 text-sm pr-9">
                  {meta.eras.map(era => (
                    <option key={era} value={era} style={{ background: "#1a1a1d" }}>{ERA_LABELS[era] ?? era}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-subtle)" }} />
              </div>
            </div>

            {/* Min rating */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Minimum rating</p>
                <span className="text-sm font-medium tnum" style={{ color: "var(--text)" }}>{filters.min_rating.toFixed(1)}</span>
              </div>
              <input
                type="range" min={meta.min_rating} max={9.5} step={0.5} value={filters.min_rating}
                onChange={e => setFilters(p => ({ ...p, min_rating: parseFloat(e.target.value) }))}
                className="mt-2.5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
