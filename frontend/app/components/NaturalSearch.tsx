"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { RecommendRequest } from "@/lib/api";

interface Props {
  onSubmit: (req: RecommendRequest) => void;
}

const EXAMPLES = [
  "something that makes me cry but has epic fight scenes",
  "a chill romance from the 2010s with high ratings",
  "spooky and mysterious, not too old",
  "hype action adventure, recent years",
];

export function NaturalSearch({ onSubmit }: Props) {
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const params = await res.json();

      if (params.error) {
        setError("Couldn't understand that — try rephrasing.");
        return;
      }

      // Pass parsed filters straight into the existing recommendation flow
      onSubmit({
        genres:     params.genres     ?? ["Action"],
        mood:       params.mood       ?? null,
        era:        params.era        ?? "any",
        min_rating: params.min_rating ?? 6.5,
        top_n:      6,
      });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 mb-8">
      <div className="glass rounded-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-body font-semibold text-white/70">
            Describe what you want
          </span>
          <span className="text-[10px] font-body text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">
            AI
          </span>
        </div>

        {/* Input */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="e.g. something that makes me cry but has epic fight scenes, not too old..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80
            font-body placeholder:text-white/25 resize-none focus:outline-none focus:border-purple-500/50
            transition-colors"
          rows={2}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-[10px] font-body text-white/35 border border-white/10 rounded-full px-3 py-1
                hover:text-white/60 hover:border-white/20 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 font-body">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full py-2.5 rounded-xl font-body font-semibold text-sm
            bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed
            text-white transition-colors"
        >
          {loading ? "Thinking..." : "Find My Anime with AI ✨"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mt-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] text-white/25 font-body">or use filters below</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    </section>
  );
}
