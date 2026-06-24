"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, ExternalLink, Bookmark, Clock } from "lucide-react";
import { useFavorites } from "../lib/useFavorites";
import { useWatchLater } from "../lib/useWatchLater";
import type { AnimeResult } from "@/lib/api";

interface Props { open: boolean; onClose: () => void; }

export function SavedPanel({ open, onClose }: Props) {
  const { favorites, removeFavorite } = useFavorites();
  const { watchLater, removeWatchLater } = useWatchLater();
  const [tab, setTab] = useState<"saved" | "later">("saved");

  const list = tab === "saved" ? favorites : watchLater;
  const remove = tab === "saved" ? removeFavorite : removeWatchLater;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{ width: "min(440px, 100vw)", background: "var(--bg-2)", borderLeft: "1px solid var(--border)" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-display font-600 text-[15px]" style={{ fontWeight: 600, color: "var(--text)" }}>Your library</h3>
              <button onClick={onClose} className="btn btn-ghost p-1.5"><X className="w-4.5 h-4.5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2" style={{ borderBottom: "1px solid var(--border)" }}>
              {([["saved", "Saved", favorites.length], ["later", "Watch Later", watchLater.length]] as const).map(([k, label, n]) => (
                <button key={k} onClick={() => setTab(k)} className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ background: tab === k ? "var(--surface-2)" : "transparent", color: tab === k ? "var(--text)" : "var(--text-subtle)" }}>
                  {label} {n > 0 && <span className="tnum">· {n}</span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {list.length === 0 && (
                <div className="text-center pt-20 px-8">
                  {tab === "saved" ? <Bookmark className="w-7 h-7 mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />
                                   : <Clock className="w-7 h-7 mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />}
                  <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                    {tab === "saved" ? "Save titles you love to find them here." : "Queue titles to watch later."}
                  </p>
                </div>
              )}

              {list.map((a: AnimeResult) => (
                <div key={a.title} className="card p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-600 text-[13.5px] line-clamp-1" style={{ fontWeight: 600, color: "var(--text)" }}>{a.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] tnum" style={{ color: "var(--text-subtle)" }}>
                      {a.rating > 0 && <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" style={{ fill: "var(--warn)", stroke: "var(--warn)" }} />{a.rating.toFixed(1)}</span>}
                      {a.year && <span>{a.year}</span>}
                      <a href={`https://myanimelist.net/search/all?q=${encodeURIComponent(a.title)}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:opacity-70" style={{ color: "var(--accent)" }}>
                        <ExternalLink className="w-3 h-3" /> Details
                      </a>
                    </div>
                  </div>
                  <button onClick={() => remove(a.title)} className="btn btn-ghost p-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
