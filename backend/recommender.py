import json
from pathlib import Path
import difflib
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

print(f"Loaded {len(df):,} anime | rating col: '{RATING_COL}'")

MOOD_MAP = {
    "hype"    : ["action", "adventure", "sport"],
    "cry"     : ["drama", "romance", "family"],
    "romance" : ["romance", "drama", "comedy"],
    "spooky"  : ["horror", "thriller", "mystery"],
    "chill"   : ["comedy", "slice of life", "family"],
}

MOOD_TERMS = {
    "cry"    : ["sad", "emotional", "tragic", "loss", "heartbreak", "tears"],
    "romance": ["love", "romance", "couple", "relationship"],
    "hype"   : ["fight", "battle", "power", "hero", "tournament", "war"],
    "spooky" : ["horror", "death", "ghost", "demon", "curse", "killer", "murder"],
    "chill"  : ["calm", "friendship", "school", "daily", "slice of life"],
}

TITLE_COL = "Title" if "Title" in df.columns else "primaryTitle"
df["_title_lower"] = df[TITLE_COL].astype(str).str.lower().str.strip()
df["_genre_lower"] = df["Genre"].astype(str).str.lower()

# English title -> Japanese/romanized title as stored in this IMDb dataset.
# This dataset uses original Japanese romanized titles for many series.
TITLE_ALIASES = {
    "attack on titan"   : "shingeki no kyojin",
    "demon slayer"      : "kimetsu no yaiba",
    "jujutsu kaisen"    : "jujutsu kaisen",
    "jujutsu"           : "jujutsu kaisen",
    "my hero academia"  : "boku no hero academia",
    "spy x family"      : "spy x family",
    "one punch man"     : "one punch man",
    "sword art online"  : "sword art online",
    "fullmetal alchemist": "hagane no renkinjutsushi",
    "haikyu"            : "haikyuu",
    "tokyo revengers"   : "tokyo revengers",
    "chainsaw man"      : "chainsaw man",
}
if "Summary" in df.columns:
    df["_summary_lower"] = df["Summary"].fillna("").astype(str).str.lower()
else:
    df["_summary_lower"] = ""


def _predict_ratings(indices):
    cluster_dummy = pd.get_dummies(df["cluster"], prefix="cluster")
    cluster_feats = csr_matrix(cluster_dummy.loc[indices].values)
    X             = hstack([tfidf_matrix[indices], cluster_feats])
    return np.clip(ridge.predict(X), 0, 10)


def _build_result(row, match_score, similarity, predicted_rating,
                  matched, total, is_title_match=False):
    return {
        "title"           : str(row.get(TITLE_COL, "Unknown")),
        "genre"           : str(row.get("Genre", row.get("genres_clean", ""))),
        "rating"          : round(float(row.get(RATING_COL, 0) or 0), 1),
        "predicted_rating": round(float(predicted_rating), 1),
        "year"            : int(row["Year"]) if "Year" in row and not pd.isna(row.get("Year")) else None,
        "votes"           : int(row["Number of Votes"]) if "Number of Votes" in row and not pd.isna(row.get("Number of Votes")) else None,
        "era"             : str(row.get("era", "")),
        "match_score"     : round(float(match_score), 4),
        "similarity"      : round(float(similarity), 4),
        "summary"         : str(row["Summary"]) if "Summary" in row and pd.notna(row.get("Summary")) else None,
        "matched_filters" : matched,
        "total_filters"   : total,
        "cluster_label"   : str(row.get("cluster_label", "")),
        "is_title_match"  : is_title_match,
    }


def search_by_title(title_query: str, top_n: int = 6) -> list[dict]:
    """Find closest matching anime by title, fill rest with similar anime by genre."""
    q = title_query.lower().strip()

    # Check alias map for popular English titles stored under
    # Japanese/romanized names in this dataset
    if q in TITLE_ALIASES:
        q = TITLE_ALIASES[q]

    # 1. Exact match
    exact = df[df["_title_lower"] == q]

    # 2. Substring match either direction
    if exact.empty:
        exact = df[df["_title_lower"].str.contains(q, na=False, regex=False)]
    if exact.empty:
        exact = df[df["_title_lower"].apply(lambda t: t in q and len(t) > 2)]

    # 3. Word-overlap fuzzy match -- handles "demon slayer" vs "Demon Slayer: Kimetsu no Yaiba"
    if exact.empty:
        q_words = set(w for w in q.split() if len(w) > 2)
        if q_words:
            overlap = df["_title_lower"].apply(
                lambda t: len(q_words & set(w for w in t.split() if len(w) > 2))
            )
            best = overlap[overlap > 0]
            if not best.empty:
                # require at least half the query words to match
                threshold = max(1, len(q_words) // 2)
                candidates = best[best >= threshold]
                if not candidates.empty:
                    exact = df.loc[candidates.sort_values(ascending=False).index]

    # 4. Typo tolerance -- fuzzy string matching against all titles
    if exact.empty:
        all_titles = df["_title_lower"].tolist()
        close = difflib.get_close_matches(q, all_titles, n=3, cutoff=0.6)
        if close:
            exact = df[df["_title_lower"].isin(close)]

    if exact.empty:
        return []

    anchor      = exact.sort_values(RATING_COL, ascending=False).iloc[0]
    anchor_idx  = anchor.name
    anchor_pred = float(_predict_ratings(pd.Index([anchor_idx]))[0])

    output = [_build_result(
        anchor,
        match_score=1.0,
        similarity=1.0,
        predicted_rating=anchor_pred,
        matched=["title match"],
        total=1,
        is_title_match=True,
    )]

    if top_n <= 1:
        return output

    anchor_genres = [g.strip() for g in str(anchor.get("Genre", "")).split(",") if g.strip()]
    similar = recommend_anime(genres=anchor_genres, min_rating=5.0, top_n=top_n + 1)

    for r in similar:
        if r["title"].lower() != anchor[TITLE_COL].lower():
            output.append(r)
        if len(output) >= top_n:
            break

    return output


def recommend_anime(genres=None, min_rating=6.0, era="any", mood=None, top_n=6):
    genres     = genres or []
    min_rating = min(min_rating, 6.5)

    # Mood-only queries: derive genres from mood so genre filtering has something to work with
    if not genres and mood:
        genres = [g.title() for g in MOOD_MAP.get(mood.lower(), [])]

    # --- Build TF-IDF query vector ---
    query_parts = [g.lower() for g in genres]
    if era and era != "any":
        query_parts.append(era)
    if mood and mood.lower() in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood.lower()])

    query_str = " ".join(query_parts) if query_parts else "anime"
    query_vec = tfidf.transform([query_str])

    query_cluster = int(kmeans.predict(query_vec)[0])

    # --- Build candidate masks ---
    base_mask = pd.Series([True] * len(df), index=df.index)
    base_mask &= df[RATING_COL].fillna(0) >= min_rating

    era_mask = base_mask.copy()
    if era and era != "any" and "era" in df.columns:
        era_mask &= df["era"] == era

    cluster_mask = df["cluster"] == query_cluster

    # Genre overlap mask -- anime must share at least one requested genre.
    # Prevents K-Means from routing unrelated queries into the same
    # dominant cluster (e.g. Animation & Comedy) regardless of genre intent.
    if genres:
        genre_set  = [g.lower() for g in genres]
        genre_overlap_count = df["_genre_lower"].apply(
            lambda g: sum(1 for gen in genre_set if gen in g)
        )
        genre_mask = genre_overlap_count > 0
    else:
        genre_set = []
        genre_overlap_count = pd.Series(0, index=df.index)
        genre_mask = pd.Series([True] * len(df), index=df.index)

    # Cascading fallback -- always returns results, prioritising genre relevance
    cluster_indices = None
    for mask in [era_mask & cluster_mask & genre_mask,
                 base_mask & cluster_mask & genre_mask,
                 era_mask & genre_mask,
                 base_mask & genre_mask,
                 era_mask,
                 base_mask,
                 pd.Series([True] * len(df), index=df.index)]:
        idx = df[mask].index
        if len(idx) >= top_n:
            cluster_indices = idx
            break

    if cluster_indices is None:
        cluster_indices = df.index

    # --- Cosine similarity within candidate pool ---
    cos_sim = cosine_similarity(query_vec, tfidf_matrix[cluster_indices]).flatten()

    # --- Ridge predicted rating ---
    pred_ratings = _predict_ratings(cluster_indices)
    pred_norm    = pred_ratings / 10.0

    # --- Normalized rating / popularity ---
    rating_vals = np.nan_to_num(df.loc[cluster_indices, "rating_norm"].values)
    pop_vals    = np.nan_to_num(df.loc[cluster_indices, "popularity"].values)

    # --- Genre overlap bonus: rewards matching MORE of the requested genres,
    #     not just any single one. Normalised by number of genres requested. ---
    if genres:
        overlap = genre_overlap_count.loc[cluster_indices].values
        genre_overlap_bonus = overlap / max(len(genres), 1)
        genre_overlap_bonus = np.clip(genre_overlap_bonus, 0, 1)
    else:
        genre_overlap_bonus = np.zeros(len(cluster_indices))

    # --- Mood bonus from plot summary keywords ---
    mood_bonus = np.zeros(len(cluster_indices))
    if mood and mood.lower() in MOOD_TERMS:
        terms = MOOD_TERMS[mood.lower()]
        summaries = df.loc[cluster_indices, "_summary_lower"].values
        for i, s in enumerate(summaries):
            if any(t in s for t in terms):
                mood_bonus[i] = 1.0

    # Cluster match bonus -- rewards anime actually in the predicted cluster,
    # so genre overlap alone can't override correct cluster placement
    cluster_match_bonus = (df.loc[cluster_indices, "cluster"] == query_cluster).astype(float).values

    # --- Final hybrid score ---
    scores = (0.35 * cos_sim
            + 0.20 * cluster_match_bonus
            + 0.15 * genre_overlap_bonus
            + 0.15 * pred_norm
            + 0.10 * rating_vals
            + 0.05 * mood_bonus)

    top_local  = np.argsort(scores)[::-1][: top_n * 4]
    top_global = cluster_indices.to_numpy()[top_local]

    results                     = df.iloc[top_global].copy()
    results["match_score"]      = scores[top_local]
    results["similarity"]       = cos_sim[top_local]
    results["predicted_rating"] = pred_ratings[top_local]
    results                     = results.drop_duplicates(subset=TITLE_COL).head(top_n)

    mood_genres = MOOD_MAP.get(mood.lower(), []) if mood else []
    total       = len(genres) + (1 if era and era != "any" else 0) + (1 if mood else 0)

    output = []
    for _, row in results.iterrows():
        anime_genres = str(row.get("Genre", row.get("genres_clean", ""))).lower()
        anime_era    = str(row.get("era", "")).lower()
        matched      = [g for g in genres if g.lower() in anime_genres]
        if era and era != "any" and anime_era == era.lower():
            matched.append(era)
        if mood and any(mg in anime_genres for mg in mood_genres):
            matched.append(mood)

        output.append(_build_result(
            row,
            match_score=float(row["match_score"]),
            similarity=float(row["similarity"]),
            predicted_rating=float(row["predicted_rating"]),
            matched=matched,
            total=total,
        ))

    return output


def get_meta():
    return _meta
