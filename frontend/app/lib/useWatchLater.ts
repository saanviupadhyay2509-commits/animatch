"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { AnimeResult } from "@/lib/api";

const STORAGE_KEY = "animatch:watchlater";
const EMPTY: AnimeResult[] = [];

let items: AnimeResult[] = [];
let hydrated = false;
const subscribers = new Set<() => void>();

function load() {
  if (hydrated) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw);
  } catch { /* ignore */ }
  hydrated = true;
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}
function notify() { subscribers.forEach(fn => fn()); }
function subscribe(cb: () => void) { subscribers.add(cb); return () => subscribers.delete(cb); }
function getSnapshot() { load(); return items; }
function getServerSnapshot() { return EMPTY; }

export function useWatchLater() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isWatchLater = useCallback((title: string) => list.some(i => i.title === title), [list]);

  const toggleWatchLater = useCallback((anime: AnimeResult) => {
    items = items.some(i => i.title === anime.title)
      ? items.filter(i => i.title !== anime.title)
      : [...items, anime];
    persist();
    notify();
  }, []);

  const removeWatchLater = useCallback((title: string) => {
    items = items.filter(i => i.title !== title);
    persist();
    notify();
  }, []);

  return { watchLater: list, isWatchLater, toggleWatchLater, removeWatchLater };
}
