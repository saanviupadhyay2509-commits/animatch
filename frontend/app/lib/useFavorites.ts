"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnimeResult } from "@/lib/api";

const STORAGE_KEY = "animatch:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<AnimeResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // storage unavailable, ignore
    }
  }, [favorites, loaded]);

  const isFavorite = useCallback(
    (title: string) => favorites.some(f => f.title === title),
    [favorites]
  );

  const toggleFavorite = useCallback((anime: AnimeResult) => {
    setFavorites(prev =>
      prev.some(f => f.title === anime.title)
        ? prev.filter(f => f.title !== anime.title)
        : [...prev, anime]
    );
  }, []);

  const removeFavorite = useCallback((title: string) => {
    setFavorites(prev => prev.filter(f => f.title !== title));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, loaded };
}
