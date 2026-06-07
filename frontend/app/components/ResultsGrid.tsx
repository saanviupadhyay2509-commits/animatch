"use client";

import { AnimeCard } from "./AnimeCard";
import type { AnimeResult } from "@/lib/api";

interface Props {
  results: AnimeResult[];
  loading: boolean;
}

export function ResultsGrid({ results, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass rounded-xl p-5">
            <div className="h-32 bg-white/5 rounded-lg mb-3 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-3/4 mb-2 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="h-2 bg-white/5 rounded w-1/3 mt-3 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-16">
        <div className="text-white/30 font-mono text-sm mb-2">
          {">_"} no matches found
        </div>
        <p className="text-white/20 text-xs">
          try lowering the rating or picking 'any' era
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {results.map((anime, i) => (
        <AnimeCard key={anime.title + i} anime={anime} index={i} />
      ))}
    </div>
  );
}