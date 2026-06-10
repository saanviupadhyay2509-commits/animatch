"use client";

import { useState } from "react";
import type { RecommendRequest } from "@/lib/api";

interface Props { onSubmit: (req: RecommendRequest) => void; }

const EXAMPLES = [
  "something emotional with beautiful animation",
  "cozy romance set in high school",
  "dark and mysterious, recent years",
  "hype action with an incredible story",
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
      if (params.error) { setError("Could not parse — try rephrasing."); return; }
      onSubmit({
        genres:     params.genres?.length ? params.genres : ["Drama"],
        mood:       params.mood       ?? null,
        era:        params.era        ?? "any",
        min_rating: Math.min(params.min_rating ?? 6.0, 6.5),
        top_n:      6,
      });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 mb-4">
      <div
        className="rounded-xl p-6 space-y-4"
        style={{
          background: "rgba(16,22,36,0.75)",
          border: "1px solid rgba(232,184,75,0.16)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(232,184,75,0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "rgba(232,184,75,0.7)" }}>✦</span>
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(232,184,75,0.55)" }}>
            ai search
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(232,184,75,0.15), transparent)" }} />
        </div>

        {/* Textarea */}
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder="describe your mood, what you feel like watching..."
          rows={2}
          className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-200 font-body"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(232,184,75,0.12)",
            color: "rgba(242,234,216,0.75)",
            caretColor: "#e8b84b",
            lineHeight: 1.6,
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(232,184,75,0.35)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,184,75,0.06)"; }}
          onBlur={e  => { e.target.style.borderColor = "rgba(232,184,75,0.12)"; e.target.style.boxShadow = "none"; }}
        />

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="font-mono text-[9px] px-2.5 py-1 rounded transition-all duration-150"
              style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.12)", color: "rgba(232,184,75,0.45)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(232,184,75,0.9)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,184,75,0.35)"; (e.currentTarget as HTMLElement).style.background = "rgba(232,184,75,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(232,184,75,0.45)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,184,75,0.12)"; (e.currentTarget as HTMLElement).style.background = "rgba(232,184,75,0.06)"; }}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && <p className="font-mono text-[11px]" style={{ color: "#e8829a" }}>{error}</p>}

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full py-2.5 rounded-lg text-sm font-mono font-semibold transition-all duration-200 btn-glow disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              reading your vibe...
            </span>
          ) : "✦  find with ai"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-5">
        <div className="flex-1 h-px" style={{ background: "rgba(232,184,75,0.08)" }} />
        <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(232,184,75,0.25)" }}>
          or filter manually
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(232,184,75,0.08)" }} />
      </div>
    </section>
  );
}
