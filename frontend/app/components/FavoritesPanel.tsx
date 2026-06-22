"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Star, ExternalLink } from "lucide-react";
import { useFavorites } from "../lib/useFavorites";
import { genreClass } from "../lib/genreColors";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FavoritesPanel({ open, onClose }: Props) {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgb(0 0 0 / 0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: "min(420px, 100vw)",
              background: "rgb(var(--surface) / 0.97)",
              borderLeft: "1px solid rgb(var(--accent) / 0.16)",
              backdropFilter: "blur(20px)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgb(var(--accent) / 0.12)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ fill: "rgb(var(--accent))", stroke: "rgb(var(--accent))" }} />
                <h3 className="font-display text-lg" style={{ color: "rgb(var(--text))" }}>
                  Collection
                </h3>
                <span className="font-mono text-[10px]" style={{ color: "rgb(var(--accent) / 0.5)" }}>
                  {favorites.length}
                </span>
              </div>
              <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60">
                <X className="w-4 h-4" style={{ color: "rgb(var(--text) / 0.5)" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {favorites.length === 0 && (
                <div className="text-center pt-16 px-6">
                  <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "rgb(var(--accent) / 0.25)" }} />
                  <p className="font-body text-[12px]" style={{ color: "rgb(var(--text) / 0.4)" }}>
                    Tap the ✦ on any card to keep it in your collection.
                  </p>
                </div>
              )}

              {favorites.map(anime => (
                <div
                  key={anime.title}
                  className="rounded-xl p-3 flex gap-3"
                  style={{ background: "rgb(var(--text) / 0.03)", border: "1px solid rgb(var(--accent) / 0.1)" }}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-sm mb-1 line-clamp-1" style={{ color: "rgb(var(--text))" }}>
                      {anime.title}
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {anime.genre.split(",").slice(0, 2).map(g => g.trim()).filter(Boolean).map(g => (
                        <span key={g} className={`genre-badge ${genreClass(g)}`}>{g.toLowerCase()}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px]" style={{ color: "rgb(var(--text) / 0.4)" }}>
                      {anime.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" style={{ fill: "rgb(var(--accent))", stroke: "rgb(var(--accent))" }} />
                          {anime.rating.toFixed(1)}
                        </span>
                      )}
                      {anime.year && <span>{anime.year}</span>}
                      <a
                        href={`https://myanimelist.net/search/all?q=${encodeURIComponent(anime.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 transition-opacity hover:opacity-70"
                        style={{ color: "rgb(var(--accent) / 0.6)" }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        MAL
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavorite(anime.title)}
                    className="self-start p-1 transition-opacity hover:opacity-60"
                    aria-label="Remove from list"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "rgb(var(--text) / 0.3)" }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
