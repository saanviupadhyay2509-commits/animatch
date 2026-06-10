"""
main.py
───────
FastAPI entry point.

Run locally:
    uvicorn main:app --reload --port 8000

On Render:
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommender import get_meta, recommend_anime

app = FastAPI(
    title="AniMatch API",
    description="Content-based anime recommendation engine (BUSS305 Final Project)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://animatch-tau.vercel.app",
        "https://animatch-1-15s9.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    # No min_length — mood-only requests send empty genres list
    genres: list[str] = Field(
        default=[],
        description="List of genre strings, e.g. ['Action', 'Fantasy']",
    )
    min_rating: float = Field(
        default=6.0,
        ge=0.0,
        le=10.0,
        description="Minimum IMDb rating (0–10)",
    )
    era: str = Field(
        default="any",
        description="Era filter: any | classic | nineties | two-thousands | twenty-tens | recent",
    )
    mood: str | None = Field(
        default=None,
        description="Mood signal: hype | cry | romance | spooky | chill",
    )
    top_n: int = Field(
        default=6,
        ge=1,
        le=20,
        description="Number of results to return",
    )


class AnimeResult(BaseModel):
    title: str
    genre: str
    rating: float
    year: int | None
    votes: int | None
    era: str
    match_score: float
    similarity: float
    summary: str | None
    matched_filters: list[str]
    total_filters: int
    cluster_label: str
    predicted_rating: float


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AniMatch API is running 🎌"}


@app.get("/meta", tags=["Metadata"])
def metadata():
    return get_meta()


@app.post("/recommend", response_model=list[AnimeResult], tags=["Recommendations"])
def recommend(req: RecommendRequest):
    # Allow mood-only requests — genres can be empty
    if not req.genres and not req.mood:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one genre or a mood."
        )

    results = recommend_anime(
        genres=req.genres,
        min_rating=req.min_rating,
        era=req.era,
        mood=req.mood,
        top_n=req.top_n,
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail="No anime found. Try lowering the minimum rating or choosing 'any' era.",
        )

    return results
