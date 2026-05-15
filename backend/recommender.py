"""
recommender.py
──────────────
Loads the trained model artifacts at startup and exposes recommend_anime().
All the heavy lifting lives here so main.py stays clean.
"""

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent

TFIDF_PATH   = BASE_DIR / "anime_tfidf.pkl"
MATRIX_PATH  = BASE_DIR / "anime_tfidf_matrix.pkl"
DATA_PATH    = BASE_DIR / "anime_data.csv"
META_PATH    = BASE_DIR / "anime_meta.json"

# ── Load at module import (once per server process) ───────────────────────────
print("Loading model artifacts...")

if not TFIDF_PATH.exists():
    raise FileNotFoundError(
        f"anime_tfidf.pkl not found at {TFIDF_PATH}. "
        "Run the fixed notebook Cell 9 and copy the pkl files to the backend/ folder."
    )

tfidf        = joblib.load(TFIDF_PATH)
tfidf_matrix = joblib.load(MATRIX_PATH)
df           = pd.read_csv(DATA_PATH)

with open(META_PATH) as f:
    _meta = json.load(f)

# Detect the rating column from metadata (handles both 'User Rating' and 'averageRating')
RATING_COL = _meta.get("rating_col", "User Rating")
if RATING_COL not in df.columns:
    # Fallback: try common names
    for candidate in ("User Rating", "averageRating", "rating"):
        if candidate in df.columns:
            RATING_COL = candidate
            break

print(f"✅ Loaded {len(df):,} anime titles | rating column: '{RATING_COL}'")

# ── Mood map (same as notebook) ───────────────────────────────────────────────
MOOD_MAP = {
    "hype"    : ["action", "adventure", "sport"],
    "cry"     : ["drama", "romance", "family"],
    "romance" : ["romance", "drama", "comedy"],
    "spooky"  : ["horror", "thriller", "mystery"],
    "chill"   : ["comedy", "slice of life", "family"],
}


def recommend_anime(
    genres: list[str],
    min_rating: float = 6.0,
    era: str = "any",
    mood: str | None = None,
    top_n: int = 6,
) -> list[dict]:
    """
    Return top_n anime recommendations as a list of dicts.

    Parameters
    ----------
    genres     : list of genre strings, e.g. ["Action", "Fantasy"]
    min_rating : minimum IMDb/user rating filter
    era        : "any" | "classic" | "nineties" | "two-thousands" | "twenty-tens" | "recent"
    mood       : optional mood key — expands to genre signals via MOOD_MAP
    top_n      : number of results to return
    """
    # Build query string
    query_parts = [g.lower().replace("-", " ") for g in genres]
    if era and era != "any":
        query_parts.append(era)
    if mood and mood in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood])

    query_str = " ".join(query_parts)

    # Vectorise the query in the same TF-IDF space as training
    query_vec = tfidf.transform([query_str])

    # Cosine similarity against every anime in the dataset
    cos_sim = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # Build filter mask
    mask = pd.Series([True] * len(df), index=df.index)
    if RATING_COL in df.columns:
        mask &= df[RATING_COL].fillna(0) >= min_rating
    if era and era != "any" and "era" in df.columns:
        mask &= df["era"] == era

    # Ensure helper columns exist (rating_norm, popularity)
    rating_norm = df["rating_norm"].fillna(0).values if "rating_norm" in df.columns else np.zeros(len(df))
    popularity  = df["popularity"].fillna(0).values  if "popularity"  in df.columns else np.zeros(len(df))

    # Composite score
    scores = 0.70 * cos_sim + 0.20 * rating_norm + 0.10 * popularity
    scores[~mask.values] = -1  # suppress filtered entries

    # Select top candidates (fetch extra to allow dedup)
    top_idx = np.argsort(scores)[::-1][: top_n * 4]
    results = df.iloc[top_idx].copy()
    results["match_score"] = scores[top_idx]
    results["similarity"]  = cos_sim[top_idx]

    # Deduplicate by title
    title_col = "Title" if "Title" in results.columns else "primaryTitle"
    results = results.drop_duplicates(subset=title_col).head(top_n)

    # Serialise to list of plain dicts (JSON-safe)
    output = []
    for _, row in results.iterrows():
        output.append({
            "title"      : str(row.get("Title", row.get("primaryTitle", "Unknown"))),
            "genre"      : str(row.get("Genre", row.get("genres_clean", ""))),
            "rating"     : round(float(row.get(RATING_COL, 0) or 0), 1),
            "year"       : int(row["Year"]) if "Year" in row and not pd.isna(row.get("Year")) else None,
            "votes"      : int(row["Number of Votes"]) if "Number of Votes" in row and not pd.isna(row.get("Number of Votes")) else None,
            "era"        : str(row.get("era", "")),
            "match_score": round(float(row["match_score"]), 4),
            "similarity" : round(float(row["similarity"]), 4),
            "summary"    : str(row["Summary"]) if "Summary" in row and pd.notna(row.get("Summary")) else None,
        })

    return output


def get_meta() -> dict:
    """Return the metadata dict loaded from anime_meta.json."""
    return _meta
