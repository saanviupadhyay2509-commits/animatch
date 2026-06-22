"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  fetchRecommendations,
  type AnimeResult,
  type SiteMeta,
  type RecommendRequest,
} from "@/lib/api";
import { Hero }          from "./components/Hero";
import { RecommendForm } from "./components/RecommendForm";
import { ResultsGrid }   from "./components/ResultsGrid";
import { SplashScreen }  from "./components/SplashScreen";
import { NaturalSearch } from "./components/NaturalSearch";
import { FavoritesPanel } from "./components/FavoritesPanel";
import { Spirit } from "./components/Spirit";
import { Atmosphere } from "./components/Atmosphere";
import { SparkleCursor } from "./components/SparkleCursor";
import { SummonOverlay } from "./components/SummonOverlay";
import { CommandPalette, type Command } from "./components/CommandPalette";
import { ScrollProgress } from "./components/ScrollProgress";
import { ThemeEngine } from "./components/ThemeEngine";
import { AccentPicker } from "./components/AccentPicker";
import { ZoneRail } from "./components/ZoneRail";
import { type SortKey } from "./components/ResultsToolbar";
import { birdSay } from "./lib/birdBus";
import { useFavorites }   from "./lib/useFavorites";
import { useHotkey, modLabel } from "./lib/useHotkeys";
import { useSound } from "./lib/useSound";
import { Sparkles, Command as CommandIcon, Volume2, VolumeX } from "lucide-react";

interface Props { meta: SiteMeta; }

const FILTERS_KEY = "animatch:filters";
const MOOD_GLYPH: Record<string, string> = { hype: "⚡", cry: "🌧️", romance: "🌸", spooky: "🌑", chill: "☁️" };

export function ClientPage({ meta }: Props) {
  const [results, setResults] = useState<AnimeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [splash, setSplash]   = useState(true);
  const [favOpen, setFavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sort, setSort]       = useState<SortKey>("match");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const { favorites } = useFavorites();
  const { muted, toggle: toggleMute, summon: summonSound } = useSound();

  const [filters, setFilters] = useState<RecommendRequest>({
    genres: [], mood: null, era: "any", min_rating: 6.5, top_n: 6,
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY);
      if (raw) setFilters(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch { /* ignore */ }
  }, [filters]);

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleSubmit = useCallback(async (req?: RecommendRequest) => {
    const finalReq = req || filters;
    summonSound();
    setLoading(true);
    setError(null);
    setResults(null);
    setLatencyMs(null);
    scrollToResults();

    const started = performance.now();
    try {
      const data = await fetchRecommendations(finalReq);
      const elapsed = performance.now() - started;
      // let the summon ritual breathe for a beat even on fast responses
      if (elapsed < 900) await new Promise(r => setTimeout(r, 900 - elapsed));
      setLatencyMs(Math.max(1, Math.round(elapsed)));
      setResults(data);

      if (finalReq.mood === "spooky") birdSay("mood_spooky");
      else if (finalReq.mood === "cry") birdSay("mood_cry");
      else if (finalReq.mood === "hype") birdSay("mood_hype");
      else if (finalReq.genres?.some(g => g.toLowerCase() === "horror")) birdSay("genre_horror");
      else if (finalReq.genres?.some(g => g.toLowerCase() === "romance")) birdSay("genre_romance");
      else if (finalReq.genres?.some(g => g.toLowerCase() === "comedy")) birdSay("genre_comedy");
      else if (finalReq.genres?.some(g => g.toLowerCase() === "action")) birdSay("genre_action");
      else birdSay("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      birdSay("no_results");
    } finally {
      setLoading(false);
    }
  }, [filters, scrollToResults, summonSound]);

  const focusSearch = useCallback(() => {
    const el = document.getElementById("anim-search") as HTMLTextAreaElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el?.focus(), 250);
  }, []);

  const runMood = useCallback((mood: string) => {
    const req: RecommendRequest = { genres: [], mood, era: "any", min_rating: 6.5, top_n: 6 };
    setFilters(req);
    handleSubmit(req);
  }, [handleSubmit]);

  const surprise = useCallback(() => {
    const pool = meta.available_genres.length ? meta.available_genres : ["Action"];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const req: RecommendRequest = { genres: [pick], mood: null, era: "any", min_rating: 6.0, top_n: 6 };
    setFilters(req);
    handleSubmit(req);
  }, [meta.available_genres, handleSubmit]);

  useHotkey("mod+k", () => setPaletteOpen(o => !o), { allowInInput: true });
  useHotkey("/", focusSearch);
  useHotkey("f", () => setFavOpen(o => !o));
  useHotkey("r", surprise);
  useHotkey("Escape", () => { setPaletteOpen(false); setFavOpen(false); }, { allowInInput: true });

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: "surprise", group: "Summon", glyph: "🎲", label: "Lucky pull", hint: "random summon", keywords: "random lucky shuffle surprise gacha", run: surprise },
      { id: "focus-search", group: "Summon", glyph: "🌙", label: "Make a wish", hint: "press /", keywords: "search find query describe vibe", run: focusSearch },
      { id: "scroll-filters", group: "Summon", glyph: "✦", label: "Open the altar", keywords: "filters genre era rating tune build", run: () => document.getElementById("altar")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
    ];
    for (const mood of meta.moods) {
      list.push({
        id: `mood-${mood}`,
        group: "Moods",
        glyph: MOOD_GLYPH[mood] ?? "✨",
        label: `Summon ${mood}`,
        hint: "instant pull",
        keywords: mood,
        run: () => runMood(mood),
      });
    }
    list.push(
      { id: "open-list", group: "Library", glyph: "✦", label: `Open Collection (${favorites.length})`, hint: "press f", keywords: "favorites saved collection cards", run: () => setFavOpen(true) },
      { id: "top", group: "Navigate", glyph: "↑", label: "Back to top", keywords: "scroll hero home", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    );
    return list;
  }, [meta.moods, favorites.length, surprise, focusSearch, runMood]);

  const pillStyle = {
    background: "rgb(var(--surface) / 0.8)",
    border: "1.5px solid rgb(var(--accent) / 0.25)",
    backdropFilter: "blur(12px)",
  };

  return (
    <ThemeEngine>
      <Atmosphere />
      <SparkleCursor />
      <ScrollProgress />
      <SplashScreen visible={splash} />
      <SummonOverlay visible={loading} />
      <ZoneRail />
      <AccentPicker />

      {/* Top-right control cluster */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
        <button onClick={toggleMute} className="grid place-items-center w-9 h-9 rounded-full transition-all duration-200 hover:brightness-125"
          style={pillStyle} aria-label={muted ? "Unmute" : "Mute"} title={muted ? "Unmute sounds" : "Mute sounds"}>
          {muted ? <VolumeX className="w-3.5 h-3.5" style={{ color: "rgb(var(--text) / 0.5)" }} /> : <Volume2 className="w-3.5 h-3.5" style={{ color: "rgb(var(--accent))" }} />}
        </button>

        <button onClick={() => setPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 hover:brightness-125"
          style={pillStyle} aria-label="Open command palette" title="Command palette">
          <CommandIcon className="w-3.5 h-3.5" style={{ color: "rgb(var(--accent))" }} />
          <span className="font-mono text-[11px]" style={{ color: "rgb(var(--text) / 0.6)" }}>{modLabel()}K</span>
        </button>

        <button onClick={() => setFavOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 hover:brightness-125"
          style={pillStyle} aria-label="Open collection">
          <Sparkles className="w-4 h-4" style={{ fill: favorites.length > 0 ? "rgb(var(--accent))" : "transparent", stroke: "rgb(var(--accent))" }} />
          <span className="font-mono text-[11px]" style={{ color: "rgb(var(--text) / 0.6)" }}>{favorites.length}</span>
        </button>
      </div>

      <FavoritesPanel open={favOpen} onClose={() => setFavOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      <Spirit />

      <div className="relative z-10">
        <Hero totalAnime={meta.total_anime} />

        {/* ── Summon altar ── */}
        <section id="altar" className="pt-6 pb-24">
          <div className="max-w-3xl mx-auto px-6 mb-8 text-center">
            <p className="font-pop text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgb(var(--accent) / 0.75)" }}>
              ✦ the summon altar ✦
            </p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "rgb(var(--text))" }}>
              Whisper a wish, or build your pull
            </h2>
          </div>

          <NaturalSearch
            onSubmit={(parsed) => { setFilters(parsed); handleSubmit(parsed); }}
            setResults={(r) => setResults(r)}
            setLoading={setLoading}
            setError={setError}
            scrollToResults={scrollToResults}
          />

          <RecommendForm
            meta={meta}
            onSubmit={handleSubmit}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
          />
        </section>

        {/* ── Summons ── */}
        <section id="results" ref={resultsRef} className="scroll-mt-8">
          <ResultsGrid
            results={results}
            loading={loading}
            error={error}
            sort={sort}
            onSortChange={setSort}
            latencyMs={latencyMs}
            onRetry={() => setResults(null)}
          />
        </section>

        {/* Footer */}
        <footer className="max-w-3xl mx-auto px-6 pb-16">
          <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--accent) / 0.25), transparent)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-center sm:text-left" style={{ color: "rgb(var(--text) / 0.3)" }}>
              AniMatch ✦ {meta.total_anime.toLocaleString()} titles ✦ made with TF-IDF, K-Means & love
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px]" style={{ color: "rgb(var(--text) / 0.35)" }}>
              <span className="flex items-center gap-1.5"><kbd className="kbd">{modLabel()}</kbd><kbd className="kbd">K</kbd></span>
              <span className="flex items-center gap-1.5"><kbd className="kbd">/</kbd> wish</span>
              <span className="flex items-center gap-1.5"><kbd className="kbd">R</kbd> lucky</span>
            </div>
          </div>
        </footer>
      </div>
    </ThemeEngine>
  );
}
