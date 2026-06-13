"use client";

import { useState, useRef, useEffect } from "react";
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
import { FriendlyBird } from "./components/FriendlyBird";
import { birdSay } from "./lib/birdBus";
import { useFavorites }   from "./lib/useFavorites";
import { Heart } from "lucide-react";

interface Props { meta: SiteMeta; }

export function ClientPage({ meta }: Props) {
  const [results, setResults] = useState<AnimeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [splash, setSplash]   = useState(true);
  const [favOpen, setFavOpen] = useState(false);
  const { favorites } = useFavorites();

  const [filters, setFilters] = useState<RecommendRequest>({
    genres: [], mood: null, era: "any", min_rating: 6.5, top_n: 6,
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  function scrollToResults() {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function handleSubmit(req?: RecommendRequest) {
    const finalReq = req || filters;
    setLoading(true);
    setError(null);
    setResults(null);
    scrollToResults();

    try {
      const data = await fetchRecommendations(finalReq);
      setResults(data);

      // React to what the user searched for
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
  }

  return (
    <>
      <SplashScreen visible={splash} />
      <Hero totalAnime={meta.total_anime} />

      {/* Floating "My List" button */}
      <button
        onClick={() => setFavOpen(true)}
        className="fixed top-5 right-5 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200"
        style={{
          background: "rgba(16,22,36,0.8)",
          border: "1px solid rgba(232,184,75,0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Heart
          className="w-4 h-4"
          style={{ fill: favorites.length > 0 ? "#e8829a" : "transparent", stroke: "#e8829a" }}
        />
        <span className="font-mono text-[11px]" style={{ color: "rgba(242,234,216,0.6)" }}>
          {favorites.length}
        </span>
      </button>

      <FavoritesPanel open={favOpen} onClose={() => setFavOpen(false)} />
      <FriendlyBird />

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

      <div ref={resultsRef}>
        <ResultsGrid
          results={results}
          loading={loading}
          error={error}
          onRetry={() => setResults(null)}
        />
      </div>

      <footer className="text-center pb-12 text-white/15 text-xs font-body">
        AniMatch · BUSS305 Final Project · Built with FastAPI + Next.js
      </footer>
    </>
  );
}
