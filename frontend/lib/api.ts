// lib/api.ts
// All communication with the FastAPI backend lives here.
// Components import from this file — never fetch() directly in components.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AnimeResult {
  title: string;
  genre: string;
  rating: number;
  year: number | null;
  votes: number | null;
  era: string;
  match_score: number;
  similarity: number;
  summary: string | null;
  matched_filters: string[];
  total_filters: number;
  cluster_label: string;
  predicted_rating: number; 
}

export interface SiteMeta {
  total_anime: number;
  available_genres: string[];
  min_rating: number;
  max_rating: number;
  eras: string[];
  moods: string[];
}

export interface RecommendRequest {
  genres: string[];
  min_rating: number;
  era: string;
  mood: string | null;
  top_n: number;
}

export async function fetchMeta(): Promise<SiteMeta> {
  const res = await fetch(`${API_URL}/meta`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to load metadata from AniMatch API");
  return res.json();
}

export async function fetchRecommendations(
  params: RecommendRequest
): Promise<AnimeResult[]> {
  const res = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store", // recommendations should always be fresh
  });

  if (res.status === 404) {
    throw new Error(
      "No anime found with those filters. Try a lower minimum rating or 'any' era."
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Recommendation request failed");
  }

  return res.json();
}
