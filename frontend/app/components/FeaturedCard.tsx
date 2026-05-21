"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Users, ExternalLink } from "lucide-react";
import type { AnimeResult } from "@/lib/api";

const GRADIENTS = [
  ["#7c6af7", "#4f46e5"],
  ["#f472b6", "#c084fc"],
  ["#60a5fa", "#6366f1"],
  ["#a78bfa", "#7c6af7"],
  ["#f472b6", "#7c6af7"],
];

function getGradient(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function formatVotes(v: number | null): string {
  if (!v) return "—";
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
}

export function FeaturedCard({ anime }: { anime: AnimeResult }) {
  const [c1, c2] = getGradient(anime.title);
  const matchedCount = anime.matched_filters?.length ?? 0;
  const totalCount   = anime.total_filters ?? 0;

  return (
    <motion.div
      className="relative w-full rounded-3xl overflow-hidden mb-6"
      style={{ minHeight: "260px" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cinematic background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${c1}55 0%, ${c2}33 50%, transparent 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(4,4,13,0.95) 0%, rgba(4,4,13,0.7) 50%, rgba(4,4,13,0.2) 100%)",
        }}
      />

      {/* Glowing orb top right */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${c1}40 0%, transparent 70%)`,
          filter: "blur(40px)",
          transform: "translate(30%, -30%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full" style={{ minHeight: "260px" }}>
        {/* Top row */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-[10px] font-body font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              background: `${c1}30`,
              border: `1px solid ${c1}60`,
              color: "#e0d7ff",
            }}
          >
            ✦ Top Pick
          </span>
          <span className="text-[10px] font-body text-white/30 tracking-widest uppercase">
            {matchedCount}/{totalCount} filters matched
          </span>
        </div>

        {/* Title */}
        <div>
          <motion.h2
            className="font-display font-bold text-white mb-3"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textShadow: `0 0 60px ${c1}80`,
              maxWidth: "600px",
            }}
          >
            {anime.title}
          </motion.h2>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genre.split(",").slice(0, 4).map(g => g.trim()).filter(Boolean).map(g => (
              <span
                key={g}
                className="text-[10px] px-2.5 py-1 rounded-full font-body font-semibold uppercase tracking-wide"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Summary */}
          {anime.summary && (
            <p
              className="font-body leading-relaxed mb-5"
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.85rem",
                maxWidth: "520px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {anime.summary}
            </p>
          )}

          {/* Bottom row */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-sm font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
              {anime.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400/90" />
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{anime.rating.toFixed(1)}</span>
                </span>
              )}
              {anime.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {anime.year}
                </span>
              )}
              {anime.votes && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {formatVotes(anime.votes)}
                </span>
              )}
            </div>

            <a
              href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-semibold text-xs text-white transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                boxShadow: `0 0 20px ${c1}50`,
              }}
            >
              <ExternalLink className="w-3 h-3" />
              View on MAL
            </a>
          </div>
        </div>
      </div>

      {/* Rank watermark */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 font-display font-bold select-none pointer-events-none"
        style={{
          fontSize: "clamp(6rem, 16vw, 12rem)",
          lineHeight: 1,
          color: "rgba(255,255,255,0.04)",
          letterSpacing: "-0.04em",
        }}
      >
        01
      </div>
    </motion.div>
  );
}
