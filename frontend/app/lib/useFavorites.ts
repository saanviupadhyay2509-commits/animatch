"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { AnimeResult } from "@/lib/api";

const STORAGE_KEY = "animatch:favorites";

let favorites: AnimeResult[] = [];
let hydrated = false;
const subscribers = new Set<() => void>();

function load() {
  if (hydrated) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) favorites = JSON.parse(raw);
  } catch {
    // ignore corrupted storage
  }
  hydrated = true;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // storage unavailable, ignore
  }
}

function notify() {
  subscribers.forEach(fn => fn());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getSnapshot() {
  load();
  return favorites;
}

function getServerSnapshot() {
  return [] as AnimeResult[];
}

export function useFavorites() {
  const favs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (title: string) => favs.some(f => f.title === title),
    [favs]
  );

  const toggleFavorite = useCallback((anime: AnimeResult) => {
    favorites = favorites.some(f => f.title === anime.title)
      ? favorites.filter(f => f.title !== anime.title)
      : [...favorites, anime];
    persist();
    notify();
  }, []);

  const removeFavorite = useCallback((title: string) => {
    favorites = favorites.filter(f => f.title !== title);
    persist();
    notify();
  }, []);

  return { favorites: favs, isFavorite, toggleFavorite, removeFavorite, loaded: hydrated };
}
