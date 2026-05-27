import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).parent

TFIDF_PATH = BASE_DIR / "anime_tfidf.pkl"
MATRIX_PATH = BASE_DIR / "anime_tfidf_matrix.pkl"
DATA_PATH = BASE_DIR / "anime_data.csv"
META_PATH = BASE_DIR / "anime_meta.json"
KMEANS_PATH = BASE_DIR / "anime_kmeans.pkl"
RIDGE_PATH = BASE_DIR / "anime_ridge.pkl"

print("Loading model artifacts...")

tfidf = joblib.load(TFIDF_PATH)
tfidf_matrix = joblib.load(MATRIX_PATH)
kmeans = joblib.load(KMEANS_PATH)
ridge = joblib.load(RIDGE_PATH)

df = pd.read_csv(DATA_PATH)

with open(META_PATH) as f:
    _meta = json.load(f)

RATING_COL = _meta.get("rating_col", "User Rating")

if RATING_COL not in df.columns:
    for candidate in ("User Rating", "averageRating", "rating"):
        if candidate in df.columns:
            RATING_COL = candidate
            break

print(f"✅ Loaded {len(df):,} anime titles")

MOOD_MAP = {
    "hype": ["action", "adventure", "sport"],
    "cry": ["drama", "romance", "family"],
    "romance": ["romance", "drama", "comedy"],
    "spooky": ["horror", "thriller", "mystery"],
    "chill": ["comedy", "slice of life", "family"],
}


def recommend_anime(
    genres,
    min_rating=6.0,
    era="any",
    mood=None,
    top_n=6,
):
    genres = genres or []

    # Mood fallback → inject semantic genres
    if not genres and mood:
        genres = MOOD_MAP.get(mood.lower(), [])

    # Build query
    query_parts = [g.lower().replace("-", " ") for g in genres]

    if era and era != "any":
        query_parts.append(era)

    if mood and mood.lower() in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood.lower()])

    query_str = " ".join(query_parts)

    # TF-IDF vector
    query_vec = tfidf.transform([query_str])

    # Cluster prediction
    query_cluster = kmeans.predict(query_vec)[0]

    # Base filtering
    mask = pd.Series([True] * len(df), index=df.index)

    if RATING_COL in df.columns:
        mask &= df[RATING_COL].fillna(0) >= min_rating

    if era and era != "any" and "era" in df.columns:
        mask &= df["era"] == era

    # Cluster filtering only when genres exist
    if genres:
        cluster_mask = df["cluster"] == query_cluster
        combined_mask = mask & cluster_mask
    else:
        combined_mask = mask

    cluster_indices = df[combined_mask].index

    # Fallback if cluster too small
    if len(cluster_indices) < top_n:
        cluster_indices = df[mask].index

    cluster_matrix = tfidf_matrix[cluster_indices]

    # Cosine similarity
    cos_sim_cluster = cosine_similarity(
        query_vec,
        cluster_matrix
    ).flatten()

    # Ranking score
    scores_cluster = (
        0.70 * cos_sim_cluster
        + 0.20 * np.nan_to_num(
            df.loc[cluster_indices, "rating_norm"].values
        )
        + 0.10 * np.nan_to_num(
            df.loc[cluster_indices, "popularity"].values
        )
    )

    top_idx_local = np.argsort(scores_cluster)[::-1][: top_n * 4]

    top_idx_global = (
        cluster_indices.to_numpy()[top_idx_local]
    )

    results = df.iloc[top_idx_global].copy()

    results["match_score"] = scores_cluster[top_idx_local]
    results["similarity"] = cos_sim_cluster[top_idx_local]

    title_col = (
        "Title"
        if "Title" in results.columns
        else "primaryTitle"
    )

    results = (
        results
        .drop_duplicates(subset=title_col)
        .head(top_n)
    )

    mood_genres = (
        MOOD_MAP.get(mood.lower(), [])
        if mood
        else []
    )

    total = (
        len(genres)
        + (1 if era and era != "any" else 0)
        + (1 if mood else 0)
    )

    output = []

    for _, row in results.iterrows():
        anime_genres = str(
            row.get(
                "Genre",
                row.get("genres_clean", "")
            )
        ).lower()

        anime_era = str(
            row.get("era", "")
        ).lower()

        matched = [
            g for g in genres
            if g.lower() in anime_genres
        ]

        if (
            era
            and era != "any"
            and anime_era == era.lower()
        ):
            matched.append(era)

        if (
            mood
            and any(
                mg in anime_genres
                for mg in mood_genres
            )
        ):
            matched.append(mood)

        output.append({
            "title": str(
                row.get(
                    "Title",
                    row.get("primaryTitle", "Unknown")
                )
            ),
            "genre": str(
                row.get(
                    "Genre",
                    row.get("genres_clean", "")
                )
            ),
            "rating": round(
                float(row.get(RATING_COL, 0) or 0),
                1
            ),
            "year": (
                int(row["Year"])
                if (
                    "Year" in row
                    and not pd.isna(row.get("Year"))
                )
                else None
            ),
            "votes": (
                int(row["Number of Votes"])
                if (
                    "Number of Votes" in row
                    and not pd.isna(
                        row.get("Number of Votes")
                    )
                )
                else None
            ),
            "era": str(row.get("era", "")),
            "match_score": round(
                float(row["match_score"]),
                4
            ),
            "similarity": round(
                float(row["similarity"]),
                4
            ),
            "summary": (
                str(row["Summary"])
                if (
                    "Summary" in row
                    and pd.notna(row.get("Summary"))
                )
                else None
            ),
            "matched_filters": matched,
            "total_filters": total,
            "cluster_label": str(
                row.get("cluster_label", "")
            ),
        })

    return output


def get_meta():
    return _meta