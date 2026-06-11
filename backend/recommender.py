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


def _predict_ratings(indices):
    """Correct Ridge prediction — each anime's own TF-IDF + cluster features."""
    cluster_dummy = pd.get_dummies(df["cluster"], prefix="cluster")
    cluster_feats = csr_matrix(cluster_dummy.loc[indices].values)
    X             = hstack([tfidf_matrix[indices], cluster_feats])
    return np.clip(ridge.predict(X), 0, 10)


def recommend_anime(genres=None, min_rating=6.0, era="any", mood=None, top_n=6):
    genres     = genres or []
    min_rating = min(min_rating, 6.5)  # cap so rating filter never kills results

    # Mood-only: derive genres from mood so query has substance
    if not genres and mood:
        genres = [g.title() for g in MOOD_MAP.get(mood.lower(), [])]

    # Build query string
    query_parts = [g.lower() for g in genres]
    if era and era != "any":
        query_parts.append(era)
    if mood and mood.lower() in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood.lower()])

    query_str = " ".join(query_parts) if query_parts else "anime"
    query_vec = tfidf.transform([query_str])

    # Stage 1 — cluster assignment
    query_cluster = int(kmeans.predict(query_vec)[0])

    # Stage 2 — cascading fallback so we always get results
    base_mask    = pd.Series([True] * len(df), index=df.index)
    base_mask   &= df[RATING_COL].fillna(0) >= min_rating
    era_mask     = base_mask.copy()
    if era and era != "any" and "era" in df.columns:
        era_mask &= df["era"] == era
    cluster_mask = df["cluster"] == query_cluster

    cluster_indices = None
    for mask in [era_mask & cluster_mask,
                 base_mask & cluster_mask,
                 era_mask,
                 base_mask,
                 pd.Series([True] * len(df), index=df.index)]:
        idx = df[mask].index
        if len(idx) >= top_n:
            cluster_indices = idx
            break

    if cluster_indices is None:
        cluster_indices = df.index

    # Stage 3 — cosine similarity within resolved set
    cos_sim = cosine_similarity(query_vec, tfidf_matrix[cluster_indices]).flatten()

    # Stage 4 — Ridge predicted ratings
    pred_ratings = _predict_ratings(cluster_indices)
    pred_norm    = pred_ratings / 10.0

    # Stage 5 — composite score
    rating_vals = np.nan_to_num(df.loc[cluster_indices, "rating_norm"].values)
    pop_vals    = np.nan_to_num(df.loc[cluster_indices, "popularity"].values)

    scores = (0.45 * cos_sim
            + 0.25 * pred_norm
            + 0.20 * rating_vals
            + 0.10 * pop_vals)

    top_local  = np.argsort(scores)[::-1][: top_n * 4]
    top_global = cluster_indices.to_numpy()[top_local]

    results                      = df.iloc[top_global].copy()
    results["match_score"]       = scores[top_local]
    results["similarity"]        = cos_sim[top_local]
    results["predicted_rating"]  = pred_ratings[top_local]

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
