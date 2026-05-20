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
    <section className="max-w-2xl mx-auto px-6 mb-6">
      <div
        className="rounded-2xl p-7 space-y-5 relative overflow-hidden"
        style={{
          background: "rgba(124,106,247,0.06)",
          border: "1px solid rgba(124,106,247,0.18)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 0 60px rgba(124,106,247,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Subtle inner glow top edge */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(124,106,247,0.5), transparent)" }}
        />

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(124,106,247,0.2)", border: "1px solid rgba(124,106,247,0.3)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-sm font-body font-semibold text-white/60 tracking-wide">
            Describe what you want
          </span>
          <span
            className="text-[9px] font-body font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{
              color: "#a78bfa",
              border: "1px solid rgba(124,106,247,0.35)",
              background: "rgba(124,106,247,0.12)",
              letterSpacing: "0.1em",
            }}
          >
            AI
          </span>
        </div>

        {/* Textarea */}
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
          className="w-full rounded-xl px-4 py-3.5 text-sm text-white/75 font-body resize-none focus:outline-none transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            lineHeight: "1.6",
            caretColor: "#7c6af7",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(124,106,247,0.4)";
            e.target.style.boxShadow = "0 0 20px rgba(124,106,247,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
          rows={2}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-[10px] font-body transition-all duration-200 rounded-full px-3 py-1.5"
              style={{
                color: "rgba(255,255,255,0.28)",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "rgba(192,132,252,0.9)";
                (e.target as HTMLElement).style.borderColor = "rgba(124,106,247,0.3)";
                (e.target as HTMLElement).style.background = "rgba(124,106,247,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.28)";
                (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.02)";
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs font-body" style={{ color: "rgba(248,113,113,0.8)" }}>{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed btn-glow"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Finding your anime...
            </span>
          ) : (
            "Find My Anime with AI ✦"
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-8">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07))" }} />
        <span className="text-[10px] text-white/20 font-body tracking-widest uppercase">or use filters below</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.07), transparent)" }} />
      </div>
    </section>
  );
}
