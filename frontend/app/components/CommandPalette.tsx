"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";

export interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords?: string;
  /** Optional leading glyph (emoji or short string). */
  glyph?: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

/** Lightweight subsequence fuzzy match — returns a score, or -1 for no match. */
function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak++;
      score += streak * 2 + (ti === 0 ? 6 : 0); // reward consecutive + start-of-string
      qi++;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : -1;
}

export function CommandPalette({ open, onClose, commands }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter + rank
  const filtered = useMemo(() => {
    const haystack = (c: Command) => `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`;
    const scored = commands
      .map(c => ({ c, score: fuzzyScore(query, haystack(c)) }))
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score);
    return scored.map(x => x.c);
  }, [commands, query]);

  // Group while preserving ranked order
  const groups = useMemo(() => {
    const out: { name: string; items: Command[] }[] = [];
    for (const c of filtered) {
      let g = out.find(x => x.name === c.group);
      if (!g) { g = { name: c.group, items: [] }; out.push(g); }
      g.items.push(c);
    }
    return out;
  }, [filtered]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after the enter animation kicks off
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  // Keep the active row in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) { onClose(); cmd.run(); }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  // Flat index lookup so grouped rendering stays in sync with arrow nav
  let flatIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4"
          style={{ paddingTop: "14vh", background: "rgb(0 0 0 / 0.5)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="cmdk w-full max-w-xl rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4" style={{ height: "56px", borderBottom: "1px solid rgb(var(--accent) / 0.12)" }}>
              <Search className="w-4 h-4 shrink-0" style={{ color: "rgb(var(--accent) / 0.7)" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or mood…"
                spellCheck={false}
                className="flex-1 bg-transparent outline-none font-body text-sm"
                style={{ color: "rgb(var(--text) / 0.9)", caretColor: "rgb(var(--accent))" }}
              />
              <kbd className="kbd">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-8 text-center font-mono text-[11px]" style={{ color: "rgb(var(--text) / 0.3)" }}>
                  no commands match “{query}”
                </p>
              )}

              {groups.map(group => (
                <div key={group.name} className="mb-1">
                  <p className="px-4 pt-2 pb-1 font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgb(var(--accent) / 0.4)" }}>
                    {group.name}
                  </p>
                  {group.items.map(cmd => {
                    flatIdx++;
                    const idx = flatIdx;
                    const isActive = idx === active;
                    return (
                      <button
                        key={cmd.id}
                        data-idx={idx}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => { onClose(); cmd.run(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{ background: isActive ? "rgb(var(--accent) / 0.12)" : "transparent" }}
                      >
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded-md text-[13px] shrink-0"
                          style={{
                            background: isActive ? "rgb(var(--accent) / 0.18)" : "rgb(var(--text) / 0.04)",
                            border: "1px solid rgb(var(--accent) / 0.14)",
                          }}
                        >
                          {cmd.glyph ?? "✦"}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-body text-[13px] truncate" style={{ color: isActive ? "rgb(var(--text))" : "rgb(var(--text) / 0.75)" }}>
                            {cmd.label}
                          </span>
                          {cmd.hint && (
                            <span className="block font-mono text-[10px] truncate" style={{ color: "rgb(var(--text) / 0.3)" }}>
                              {cmd.hint}
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <CornerDownLeft className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--accent) / 0.6)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer legend */}
            <div className="flex items-center gap-4 px-4 py-2.5 font-mono text-[10px]" style={{ borderTop: "1px solid rgb(var(--accent) / 0.1)", color: "rgb(var(--text) / 0.3)" }}>
              <span className="flex items-center gap-1.5"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> navigate</span>
              <span className="flex items-center gap-1.5"><CornerDownLeft className="w-3 h-3" /> select</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span style={{ color: "rgb(var(--accent) / 0.6)" }}>✦</span> animatch
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
