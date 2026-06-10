"""
recommender.py
──────────────
Two-stage ML pipeline: K-Means clustering → cosine similarity + Ridge scoring.
"""

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR    = Path(__file__).parent
TFIDF_PATH  = BASE_DIR / "anime_tfidf.pkl"
MATRIX_PATH = BASE_DIR / "anime_tfidf_matrix.pkl"
DATA_PATH   = BASE_DIR / "anime_data.csv"
META_PATH   = BASE_DIR / "anime_meta.json"
KMEANS_PATH = BASE_DIR / "anime_kmeans.pkl"
RIDGE_PATH  = BASE_DIR / "anime_ridge.pkl"

print("Loading model artifacts...")

tfidf        = joblib.load(TFIDF_PATH)
tfidf_matrix = joblib.load(MATRIX_PATH)
kmeans       = joblib.load(KMEANS_PATH)
ridge        = joblib.load(RIDGE_PATH)
df           = pd.read_csv(DATA_PATH)

with open(META_PATH) as f:
    _meta = json.load(f)

RATING_COL = _meta.get("rating_col", "User Rating")
if RATING_COL not in df.columns:
    for candidate in ("User Rating", "averageRating", "rating"):
        if candidate in df.columns:
            RATING_COL = candidate
            break

print(f"✅ Loaded {len(df):,} anime | rating col: '{RATING_COL}'")

MOOD_MAP = {
    "hype"    : ["action", "adventure", "sport"],
    "cry"     : ["drama", "romance", "family"],
    "romance" : ["romance", "drama", "comedy"],
    "spooky"  : ["horror", "thriller", "mystery"],
    "chill"   : ["comedy", "slice of life", "family"],
}

MOOD_SUMMARY_TERMS = {
    "cry"     : ["sad", "emotional", "tragic", "tear", "heartbreak", "drama", "loss"],
    "romance" : ["love", "romance", "relationship", "couple", "feelings"],
    "hype"    : ["fight", "battle", "power", "tournament", "tournament", "hero"],
    "spooky"  : ["horror", "death", "murder", "ghost", "demon", "curse", "fear"],
    "chill"   : ["slice of life", "calm", "friendship", "school", "daily"],
}


def _get_predicted_ratings(indices):
    """Correct Ridge prediction: use each anime's own TF-IDF + cluster features."""
    anime_vecs    = tfidf_matrix[indices]
    cluster_dummy = pd.get_dummies(df["cluster"], prefix="cluster")
    cluster_feats = csr_matrix(cluster_dummy.loc[indices].values)
    X             = hstack([anime_vecs, cluster_feats])
    preds         = ridge.predict(X)
    return np.clip(preds, 0, 10)


def _build_mask(min_rating, era):
    mask = pd.Series([True] * len(df), index=df.index)
    if RATING_COL in df.columns:
        mask &= df[RATING_COL].fillna(0) >= min_rating
    if era and era != "any" and "era" in df.columns:
        mask &= df["era"] == era
    return mask


def _resolve_indices(query_cluster, genres, min_rating, era, top_n):
    """
    Cascading fallback so we always return results:
    1. cluster + rating + era
    2. cluster + rating (drop era)
    3. rating only (drop cluster)
    4. no filters at all
    """
    base_mask    = _build_mask(min_rating, era)
    no_era_mask  = _build_mask(min_rating, "any")
    cluster_mask = df["cluster"] == query_cluster

    candidates = [
        base_mask & cluster_mask,   # ideal: cluster + era + rating
        no_era_mask & cluster_mask,  # drop era
        base_mask,                   # drop cluster
        no_era_mask,                 # drop era + cluster
        pd.Series([True] * len(df), index=df.index),  # last resort
    ]

    for mask in candidates:
        idx = df[mask].index
        if len(idx) >= top_n:
            return idx

    return df.index  # absolute fallback


def recommend_anime(genres=None, min_rating=6.0, era="any", mood=None, top_n=6):
    genres     = genres or []
    min_rating = min(min_rating, 6.5)   # never let rating filter kill results

    # If no genres provided, derive from mood
    if not genres and mood:
        genres = [g.title() for g in MOOD_MAP.get(mood.lower(), [])]

    # Build query string
    query_parts = [g.lower().replace("-", " ") for g in genres]
    if era and era != "any":
        query_parts.append(era)
    if mood and mood.lower() in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood.lower()])

    query_str = " ".join(query_parts) if query_parts else "anime"
    query_vec = tfidf.transform([query_str])

    # Stage 1 — cluster assignment
    query_cluster = int(kmeans.predict(query_vec)[0])

    # Stage 2 — resolve indices with fallback cascade
    cluster_indices = _resolve_indices(query_cluster, genres, min_rating, era, top_n)

    # Stage 3 — cosine similarity within resolved set
    cluster_matrix  = tfidf_matrix[cluster_indices]
    cos_sim         = cosine_similarity(query_vec, cluster_matrix).flatten()

    # Stage 4 — Ridge predicted ratings (correct: anime vectors not query)
    predicted_ratings = _get_predicted_ratings(cluster_indices)
    predicted_norm    = predicted_ratings / 10.0

    # Stage 5 — mood bonus from summary text
    mood_bonus = np.zeros(len(cluster_indices))
    if mood:
        mood_terms = MOOD_SUMMARY_TERMS.get(mood.lower(), [])
        for i, idx in enumerate(cluster_indices):
            text = str(df.loc[idx].get("Summary", "")).lower()
            if any(t in text for t in mood_terms):
                mood_bonus[i] += 0.15

    # Stage 6 — hybrid score
    rating_norm  = np.nan_to_num(df.loc[cluster_indices, "rating_norm"].values)
    popularity   = np.nan_to_num(df.loc[cluster_indices, "popularity"].values)

    scores = (
        0.45 * cos_sim
        + 0.25 * predicted_norm
        + 0.15 * rating_norm
        + 0.05 * popularity
        + 0.10 * mood_bonus
    )

    top_local  = np.argsort(scores)[::-1][: top_n * 4]
    top_global = cluster_indices.to_numpy()[top_local]

    results                      = df.iloc[top_global].copy()
    results["match_score"]       = scores[top_local]
    results["similarity"]        = cos_sim[top_local]
    results["predicted_rating"]  = predicted_ratings[top_local]

    title_col = "Title" if "Title" in results.columns else "primaryTitle"
    results   = results.drop_duplicates(subset=title_col).head(top_n)

    # Build output
    mood_genres = MOOD_MAP.get(mood.lower(), []) if mood else []
    total       = len(genres) + (1 if era and era != "any" else 0) + (1 if mood else 0)

    output = []
    for _, row in results.iterrows():
        anime_genres = str(row.get("Genre", row.get("genres_clean", ""))).lower()
        anime_era    = str(row.get("era", "")).lower()

        matched = [g for g in genres if g.lower() in anime_genres]
        if era and era != "any" and anime_era == era.lower():
            matched.append(era)
        if mood and any(mg in anime_genres for mg in mood_genres):
            matched.append(mood)

        output.append({
            "title"           : str(row.get("Title", row.get("primaryTitle", "Unknown"))),
            "genre"           : str(row.get("Genre", row.get("genres_clean", ""))),
            "rating"          : round(float(row.get(RATING_COL, 0) or 0), 1),
            "predicted_rating": round(float(row.get("predicted_rating", 0)), 1),
            "year"            : int(row["Year"]) if "Year" in row and not pd.isna(row.get("Year")) else None,
            "votes"           : int(row["Number of Votes"]) if "Number of Votes" in row and not pd.isna(row.get("Number of Votes")) else None,
            "era"             : str(row.get("era", "")),
            "match_score"     : round(float(row["match_score"]), 4),
            "similarity"      : round(float(row["similarity"]), 4),
            "summary"         : str(row["Summary"]) if "Summary" in row and pd.notna(row.get("Summary")) else None,
            "matched_filters" : matched,
            "total_filters"   : total,
            "cluster_label"   : str(row.get("cluster_label", "")),
        })

    return output


def get_meta():
    return _meta
