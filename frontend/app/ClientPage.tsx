"use client";

import { useState, useRef, useEffect, Suspense } from "react";

import {
  fetchRecommendations,
  type AnimeResult,
  type SiteMeta,
  type RecommendRequest,
} from "@/lib/api";

import { Hero } from "./components/Hero";
import { RecommendForm } from "./components/RecommendForm";
import { ResultsGrid } from "./components/ResultsGrid";
import { SplashScreen } from "./components/SplashScreen";
import { NaturalSearch } from "./components/NaturalSearch";

interface Props {
  meta: SiteMeta;
}

export function ClientPage({ meta }: Props) {
  const [results, setResults] = useState<AnimeResult[] | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [splash, setSplash] = useState(true);

  // SHARED FILTER STATE
  const [filters, setFilters] = useState<RecommendRequest>({
    genres: [],
    mood: "",
    era: "any",
    min_rating: 6.5,
    top_n: 6,
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(req?: RecommendRequest) {
    const finalReq = req || filters;

    setLoading(true);
    setError(null);
    setResults(null);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    try {
      const data = await fetchRecommendations(finalReq);
      setResults(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SplashScreen visible={splash} />

      <Hero totalAnime={meta.total_anime} />

      <NaturalSearch
        onSubmit={(parsed) => {
          setFilters(parsed);
          handleSubmit(parsed);
        }}
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