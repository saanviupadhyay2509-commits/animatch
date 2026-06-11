from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from recommender import get_meta, recommend_anime, search_by_title

app = FastAPI(
    title="AniMatch API",
    description="Content-based anime recommendation engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    genres: list[str] = Field(default=[])
    min_rating: float = Field(default=6.0, ge=0.0, le=10.0)
    era: str          = Field(default="any")
    mood: str | None  = Field(default=None)
    top_n: int        = Field(default=6, ge=1, le=20)


class TitleSearchRequest(BaseModel):
    query: str
    top_n: int = Field(default=6, ge=1, le=20)


class AnimeResult(BaseModel):
    title: str
    genre: str
    rating: float
    predicted_rating: float
    year: int | None
    votes: int | None
    era: str
    match_score: float
    similarity: float
    summary: str | None
    matched_filters: list[str]
    total_filters: int
    cluster_label: str
    is_title_match: bool = False


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AniMatch API is running 🎌"}


@app.get("/meta", tags=["Metadata"])
def metadata():
    return get_meta()


@app.post("/recommend", response_model=list[AnimeResult], tags=["Recommendations"])
def recommend(req: RecommendRequest):
    if not req.genres and not req.mood:
        raise HTTPException(status_code=400, detail="Provide at least one genre or a mood.")

    results = recommend_anime(
        genres=req.genres,
        min_rating=req.min_rating,
        era=req.era,
        mood=req.mood,
        top_n=req.top_n,
    )

    if not results:
        raise HTTPException(status_code=404, detail="No anime found. Try different filters.")

    return results


@app.post("/search", response_model=list[AnimeResult], tags=["Title Search"])
def title_search(req: TitleSearchRequest):
    results = search_by_title(req.query, top_n=req.top_n)

    if not results:
        raise HTTPException(status_code=404, detail=f"No anime found matching '{req.query}'.")

    return results
