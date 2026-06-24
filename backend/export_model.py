"""Export the trained AniMatch model (TF-IDF + K-Means + Ridge) + dataset to a
single JSON the Next.js serverless API can load — so the deployed app runs the
real model with no separate Python backend."""
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

BASE = Path(__file__).parent
tfidf        = joblib.load(BASE / "anime_tfidf.pkl")
tfidf_matrix = joblib.load(BASE / "anime_tfidf_matrix.pkl").tocsr()
kmeans       = joblib.load(BASE / "anime_kmeans.pkl")
ridge        = joblib.load(BASE / "anime_ridge.pkl")
df           = pd.read_csv(BASE / "anime_data.csv")
meta         = json.load(open(BASE / "anime_meta.json"))

V = tfidf_matrix.shape[1]
K = int(kmeans.n_clusters)
print(f"V={V} terms, K={K} clusters, {len(df)} titles")

def r5(x):
    return round(float(x), 5)

# vocabulary term -> column index, and idf weights (for building query vectors)
vocab = {term: int(i) for term, i in tfidf.vocabulary_.items()}
idf   = [r5(v) for v in tfidf.idf_]

# per-title sparse tf-idf rows (already L2-normalized by sklearn)
titles = []
indptr, indices, data = tfidf_matrix.indptr, tfidf_matrix.indices, tfidf_matrix.data
for i in range(len(df)):
    row = df.iloc[i]
    vec = [[int(indices[j]), r5(data[j])] for j in range(indptr[i], indptr[i + 1])]
    summary = row.get("Summary")
    summary = "" if pd.isna(summary) else str(summary)
    if len(summary) > 340:
        summary = summary[:337].rstrip() + "..."
    titles.append({
        "t":    str(row["Title"]),
        "g":    str(row["Genre"]),
        "r":    None if pd.isna(row.get("User Rating")) else round(float(row["User Rating"]), 1),
        "y":    None if pd.isna(row.get("Year")) else int(row["Year"]),
        "v":    None if pd.isna(row.get("Number of Votes")) else int(row["Number of Votes"]),
        "e":    str(row.get("era", "")),
        "c":    int(row["cluster"]),
        "cl":   str(row.get("cluster_label", "")),
        "rn":   r5(row.get("rating_norm", 0) or 0),
        "pop":  r5(row.get("popularity", 0) or 0),
        "gl":   str(row.get("genres_clean", "")).lower(),
        "sl":   summary.lower(),
        "s":    summary,
        "vec":  vec,
    })

centroids      = [[r5(x) for x in c] for c in kmeans.cluster_centers_]
centroid_norms = [r5(float(np.dot(c, c))) for c in kmeans.cluster_centers_]

model = {
    "meta": meta,
    "V": V, "K": K,
    "vocab": vocab,
    "idf": idf,
    "centroids": centroids,
    "centroid_norms": centroid_norms,
    "ridge_coef": [r5(x) for x in ridge.coef_],
    "ridge_intercept": r5(ridge.intercept_),
    "titles": titles,
}

out = BASE.parent / "frontend" / "lib" / "model.json"
out.parent.mkdir(parents=True, exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    json.dump(model, f, separators=(",", ":"), ensure_ascii=False)

mb = out.stat().st_size / 1024 / 1024
print(f"Wrote {out} ({mb:.1f} MB)")
