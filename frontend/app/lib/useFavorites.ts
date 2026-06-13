"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "animatch:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
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
    (title: string) => favorites.includes(title),
    [favorites]
  );

  const toggleFavorite = useCallback((title: string) => {
    setFavorites(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  }, []);

  return { favorites, isFavorite, toggleFavorite, loaded };
}
