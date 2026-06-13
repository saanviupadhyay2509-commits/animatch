"use client";

import { useState } from "react";
import type { AnimeResult, RecommendRequest } from "@/lib/api";
import { birdSay } from "../lib/birdBus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  onSubmit:    (req: RecommendRequest) => void;
  setResults:  (r: AnimeResult[]) => void;
  setLoading:  (v: boolean) => void;
  setError:    (e: string | null) => void;
  scrollToResults: () => void;
}

const EXAMPLES = [
  "Naruto",
  "One Piece",
  "something emotional with great fights",
  "cozy romance, high school setting",
  "dark and spooky, recent",
];

export function NaturalSearch({ onSubmit, setResults, setLoading, setError, scrollToResults }: Props) {
  const [query, setQuery]       = useState("");
  const [localLoad, setLocalLoad] = useState(false);

  function looksLikeTitle(q: string): boolean {
    const lower = q.toLowerCase().trim();
    const descriptive = /\b(something|show|anime|movie|want|like|feel|mood|genre|make|cry|sad|happy|scary|funny|chill|hype|dark|light|old|new|recent|classic|emotional|exciting|romantic|spooky|cozy|relaxing)\b/;
    const wordCount = q.trim().split(/\s+/).length;
    return wordCount <= 4 && !descriptive.test(lower);
  }

  async function handleSearch() {
    if (!query.trim()) return;

    setLocalLoad(true);
    setLoading(true);
    setError(null);
    setResults([]);
    scrollToResults();

    try {
      // Title search path
      if (looksLikeTitle(query)) {
        const res = await fetch(`${API_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), top_n: 6 }),
        });

        if (res.ok) {
          const data = await res.json();
          setResults(data);
          birdSay("title_search");
          setLoading(false);
          return;
        }

        if (res.status === 404) {
          setError(`"${query.trim()}" wasn't found in the database. Try the AI description search instead — e.g. "something emotional with great fights".`);
          birdSay("no_results");
          setLoading(false);
          return;
        }
        // other errors fall through to AI description search
      }

      // AI description search path
      const parseRes = await fetch("/api/parse-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const params = await parseRes.json();

      if (params.error) {
        setError("Could not parse — try rephrasing.");
        setLoading(false);
        return;
      }

      onSubmit({
        genres:     params.genres?.length ? params.genres : ["Drama"],
        mood:       params.mood   ?? null,
        era:        params.era    ?? "any",
        min_rating: Math.min(params.min_rating ?? 6.0, 6.5),
        top_n:      6,
      });

    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    } finally {
      setLocalLoad(false);
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
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "rgba(232,184,75,0.7)" }}>✦</span>
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(232,184,75,0.55)" }}>
            search by title or describe what you want
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(232,184,75,0.15), transparent)" }} />
        </div>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder='"Naruto", "Death Note", or "something emotional with great fights"...'
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

        <button
          onClick={handleSearch}
          disabled={localLoad || !query.trim()}
          className="w-full py-2.5 rounded-lg text-sm font-mono font-semibold transition-all duration-200 btn-glow disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {localLoad ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              searching...
            </span>
          ) : "✦  search"}
        </button>
      </div>

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
