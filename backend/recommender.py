def recommend_anime(
    genres,
    min_rating=6.0,
    era="any",
    mood=None,
    top_n=6,
):
    genres = genres or []

    # Mood fallback
    if not genres and mood:
        genres = MOOD_MAP.get(mood.lower(), [])

    # Build NLP query
    query_parts = [g.lower().replace("-", " ") for g in genres]

    if era and era != "any":
        query_parts.append(era)

    if mood and mood.lower() in MOOD_MAP:
        query_parts.extend(MOOD_MAP[mood.lower()])

    query_str = " ".join(query_parts)

    # TF-IDF query vector
    query_vec = tfidf.transform([query_str])

    # Predict cluster
    query_cluster = kmeans.predict(query_vec)[0]

    # Base filtering
    mask = pd.Series([True] * len(df), index=df.index)

    if RATING_COL in df.columns:
        mask &= df[RATING_COL].fillna(0) >= min_rating

    if era and era != "any" and "era" in df.columns:
        mask &= df["era"] == era

    # Use cluster filtering only if genres exist
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

    # Ridge features
    cluster_dummies = pd.get_dummies(
        df["cluster"],
        prefix="cluster"
    )

    cluster_features = cluster_dummies.loc[
        cluster_indices
    ].values

    query_repeat = np.repeat(
        query_vec.toarray(),
        len(cluster_indices),
        axis=0
    )

    ridge_input = hstack([
        csr_matrix(query_repeat),
        csr_matrix(cluster_features)
    ])

    predicted_ratings = ridge.predict(
        ridge_input
    )

    # Normalize ridge predictions
    predicted_norm = (
        predicted_ratings / 10.0
    )

    # Mood bonus
    mood_bonus = np.zeros(len(cluster_indices))

    if mood:
        mood_terms_map = {
            "cry": [
                "sad",
                "emotional",
                "tragic",
                "tear",
                "heartbreak",
                "drama",
            ],
            "romance": [
                "love",
                "romance",
                "relationship",
                "couple",
            ],
            "hype": [
                "fight",
                "battle",
                "power",
                "tournament",
            ],
            "spooky": [
                "horror",
                "death",
                "murder",
                "ghost",
            ],
            "chill": [
                "slice of life",
                "calm",
                "friendship",
                "school",
            ],
        }

        mood_terms = mood_terms_map.get(
            mood.lower(),
            [],
        )

        for i, idx in enumerate(cluster_indices):
            text = str(
                df.loc[idx].get(
                    "Summary",
                    ""
                )
            ).lower()

            if any(
                term in text
                for term in mood_terms
            ):
                mood_bonus[i] += 0.15

    # FINAL HYBRID ML SCORE
    scores_cluster = (
        0.45 * cos_sim_cluster
        + 0.25 * predicted_norm
        + 0.15 * np.nan_to_num(
            df.loc[
                cluster_indices,
                "rating_norm"
            ].values
        )
        + 0.05 * np.nan_to_num(
            df.loc[
                cluster_indices,
                "popularity"
            ].values
        )
        + 0.10 * mood_bonus
    )

    top_idx_local = np.argsort(
        scores_cluster
    )[::-1][: top_n * 4]

    top_idx_global = (
        cluster_indices.to_numpy()[
            top_idx_local
        ]
    )

    results = df.iloc[
        top_idx_global
    ].copy()

    results["match_score"] = (
        scores_cluster[top_idx_local]
    )

    results["similarity"] = (
        cos_sim_cluster[top_idx_local]
    )

    results["predicted_rating"] = (
        predicted_ratings[top_idx_local]
    )

    title_col = (
        "Title"
        if "Title" in results.columns
        else "primaryTitle"
    )

    results = (
        results
        .drop_duplicates(
            subset=title_col
        )
        .head(top_n)
    )

    mood_genres = (
        MOOD_MAP.get(
            mood.lower(),
            []
        )
        if mood
        else []
    )

    total = (
        len(genres)
        + (
            1
            if era and era != "any"
            else 0
        )
        + (
            1
            if mood
            else 0
        )
    )

    output = []

    for _, row in results.iterrows():

        anime_genres = str(
            row.get(
                "Genre",
                row.get(
                    "genres_clean",
                    ""
                )
            )
        ).lower()

        anime_era = str(
            row.get(
                "era",
                ""
            )
        ).lower()

        matched = [
            g for g in genres
            if g.lower()
            in anime_genres
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
                    row.get(
                        "primaryTitle",
                        "Unknown"
                    )
                )
            ),
            "genre": str(
                row.get(
                    "Genre",
                    row.get(
                        "genres_clean",
                        ""
                    )
                )
            ),
            "rating": round(
                float(
                    row.get(
                        RATING_COL,
                        0
                    ) or 0
                ),
                1
            ),
            "predicted_rating": round(
                float(
                    row.get(
                        "predicted_rating",
                        0
                    )
                ),
                1
            ),
            "year": (
                int(row["Year"])
                if (
                    "Year" in row
                    and not pd.isna(
                        row.get("Year")
                    )
                )
                else None
            ),
            "votes": (
                int(
                    row[
                        "Number of Votes"
                    ]
                )
                if (
                    "Number of Votes"
                    in row
                    and not pd.isna(
                        row.get(
                            "Number of Votes"
                        )
                    )
                )
                else None
            ),
            "era": str(
                row.get(
                    "era",
                    ""
                )
            ),
            "match_score": round(
                float(
                    row[
                        "match_score"
                    ]
                ),
                4
            ),
            "similarity": round(
                float(
                    row[
                        "similarity"
                    ]
                ),
                4
            ),
            "summary": (
                str(row["Summary"])
                if (
                    "Summary" in row
                    and pd.notna(
                        row.get(
                            "Summary"
                        )
                    )
                )
                else None
            ),
            "matched_filters": matched,
            "total_filters": total,
            "cluster_label": str(
                row.get(
                    "cluster_label",
                    ""
                )
            ),
        })

    return output