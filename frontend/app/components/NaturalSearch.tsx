"use client";

import { useState } from "react";
import type { RecommendRequest } from "@/lib/api";

interface Props {
  onSubmit: (req: RecommendRequest) => void;
}

const EXAMPLES = [
  "something emotional with great fight scenes",
  "a chill romance from the 2010s",
  "spooky and dark, recent years",
  "hype action, highly rated",
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
        setError("Could not parse that — try rephrasing.");
        return;
      }

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
      <div className="glass rounded-xl p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#e05263" }}>
            AI search
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Input */}
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder="describe what you want in plain english..."
          rows={2}
          className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-200 font-mono"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.75)",
            caretColor: "#e05263",
            lineHeight: 1.6,
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(224,82,99,0.35)"; }}
          onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="font-mono text-[10px] px-2.5 py-1 rounded transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(224,82,99,0.8)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(224,82,99,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="font-mono text-[11px]" style={{ color: "rgba(224,82,99,0.7)" }}>{error}</p>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full py-2.5 rounded-lg text-sm font-mono font-semibold text-white transition-all duration-200 btn-glow disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              parsing your vibe...
            </span>
          ) : (
            "→ find with AI"
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 mt-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.15)" }}>or filter manually</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
    </section>
  );
}
