"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  fetchRecommendations,
  type AnimeResult,
  type SiteMeta,
  type RecommendRequest,
} from "@/lib/api";
import { Sidebar } from "./components/Sidebar";
import { Hero } from "./components/Hero";
import { SearchPanel } from "./components/SearchPanel";
import { Results } from "./components/Results";
import { HowItWorks } from "./components/HowItWorks";
import { SavedPanel } from "./components/SavedPanel";
import { useFavorites } from "./lib/useFavorites";
import { useWatchLater } from "./lib/useWatchLater";
import { Bookmark } from "lucide-react";

interface Props { meta: SiteMeta; }

const PIPELINE_MS = 2400; // signature reveal floor

function looksLikeTitle(q: string): boolean {
  const lower = q.toLowerCase().trim();
  const descriptive = /\b(something|show|anime|movie|want|like|feel|mood|genre|make|cry|sad|happy|scary|funny|chill|hype|dark|light|old|new|recent|classic|emotional|exciting|romantic|spooky|cozy|relaxing|binge|world|building|psychological|mystery|fantasy|action|female|lead|stressful)\b/;
  return q.trim().split(/\s+/).length <= 4 && !descriptive.test(lower);
}

export function ClientPage({ meta }: Props) {
  const [results, setResults] = useState<AnimeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savedOpen, setSavedOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [generated, setGenerated] = useState(0);

  const [filters, setFilters] = useState<RecommendRequest>({
    genres: [], mood: null, era: "any", min_rating: 6.5, top_n: 9,
  });

  const { favorites } = useFavorites();
  const { watchLater } = useWatchLater();
  const resultsRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, []);

  // Core: run the pipeline reveal, resolve a request, fetch, show.
  const run = useCallback(async (opts: { request?: RecommendRequest; q?: string }) => {
    setError(null);
    setResults(null);
    setLoading(true);
    scrollTo(resultsRef);
    const started = performance.now();

    const finish = async (data: AnimeResult[] | null, err: string | null) => {
      const elapsed = performance.now() - started;
      if (elapsed < PIPELINE_MS) await new Promise(r => setTimeout(r, PIPELINE_MS - elapsed));
      setResults(data);
      setError(err);
      setLoading(false);
      if (data && data.length) setGenerated(g => g + 1);
    };

    try {
      const q = (opts.q ?? "").trim();

      // Title lookup
      if (q && looksLikeTitle(q)) {
        const res = await fetch(`/api/search`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, top_n: 9 }),
        });
        if (res.ok) return finish(await res.json(), null);
        if (res.status === 404) return finish(null, `We couldn't find "${q}". Try describing the vibe instead.`);
      }

      // Natural-language description
      if (q) {
        const parseRes = await fetch("/api/parse-query", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }),
        });
        const params = await parseRes.json().catch(() => ({}));
        if (!params.error) {
          const req: RecommendRequest = {
            genres: params.genres?.length ? params.genres : ["Drama"],
            mood: params.mood ?? null,
            era: params.era ?? "any",
            min_rating: Math.min(params.min_rating ?? 6.0, 6.5),
            top_n: 9,
          };
          return finish(await fetchRecommendations(req), null);
        }
      }

      // Structured filters
      const req = opts.request ?? filters;
      if (!req.genres.length && !req.mood && !q) {
        return finish(null, "Describe what you're in the mood for, or pick a mood or genre.");
      }
      return finish(await fetchRecommendations({ ...req, top_n: 9 }), null);
    } catch (e: unknown) {
      return finish(null, e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }, [filters, scrollTo]);

  const onGenerate = useCallback(() => { setActive("recs"); run({ q: query }); }, [query, run]);
  const onSuggest = useCallback((q: string) => { setQuery(q); setActive("recs"); run({ q }); }, [run]);
  const onExplore = useCallback(() => {
    setActive("discover");
    run({ request: { genres: ["Action", "Adventure", "Fantasy"], mood: null, era: "any", min_rating: 7.5, top_n: 9 } });
  }, [run]);

  const focusSearch = useCallback(() => {
    scrollTo(discoverRef);
    setTimeout(() => document.getElementById("anim-search")?.focus(), 320);
  }, [scrollTo]);

  const onNavigate = useCallback((key: string) => {
    setActive(key);
    if (key === "saved" || key === "history") { setSavedOpen(true); return; }
    if (key === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (key === "discover" || key === "recs") focusSearch();
    else if (key === "about" || key === "settings") document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }, [focusSearch]);

  const avgMatch = useMemo(() => {
    if (!results?.length) return 0;
    const norm = (x: number) => (x <= 1 ? x * 100 : x);
    return Math.round(results.reduce((s, a) => s + norm(a.match_score > 0 ? a.match_score : a.similarity), 0) / results.length);
  }, [results]);

  const stats = [
    { label: "Recommendations", value: generated },
    { label: "Avg match", value: results?.length ? `${avgMatch}%` : "—" },
    { label: "Saved", value: favorites.length },
    { label: "Watch later", value: watchLater.length },
  ];

  return (
    <div>
      <Sidebar active={active} onNavigate={onNavigate} savedCount={favorites.length} />

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(14,14,16,0.85)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
        <span className="font-display font-600" style={{ fontWeight: 600 }}>AniMatch</span>
        <button onClick={() => setSavedOpen(true)} className="btn btn-ghost p-2 relative">
          <Bookmark className="w-5 h-5" />
          {favorites.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
        </button>
      </div>

      <div className="md:pl-[244px] pb-16 md:pb-0">
        <Hero totalAnime={meta.total_anime} onGenerate={focusSearch} onExplore={onExplore} />

        <div ref={discoverRef} className="scroll-mt-6">
          <SearchPanel meta={meta} query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} onGenerate={onGenerate} loading={loading} />
        </div>

        {/* Session stats */}
        <div className="max-w-3xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className="card p-3 text-center">
                <p className="font-display font-600 text-lg tnum" style={{ fontWeight: 600, color: "var(--text)" }}>{s.value}</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: "var(--text-subtle)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-6">
          <Results results={results} loading={loading} error={error} onSuggest={onSuggest} onRetry={() => { setResults(null); setError(null); focusSearch(); }} />
        </div>

        <HowItWorks />

        <footer className="max-w-5xl mx-auto px-6 pb-16">
          <div className="h-px mb-6" style={{ background: "var(--border)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-serif text-lg" style={{ color: "var(--text)" }}>AniMatch</p>
            <p className="text-[12.5px] text-center sm:text-right" style={{ color: "var(--text-subtle)" }}>
              Built for people who spend more time choosing than watching.
            </p>
          </div>
        </footer>
      </div>

      <SavedPanel open={savedOpen} onClose={() => setSavedOpen(false)} />
    </div>
  );
}
