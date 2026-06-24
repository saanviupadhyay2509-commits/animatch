import { NextRequest, NextResponse } from "next/server";
import { recommendAnime } from "@/lib/recommend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const genres: string[] = Array.isArray(body.genres) ? body.genres : [];
    const mood: string | null = body.mood ?? null;

    if (genres.length === 0 && !mood) {
      return NextResponse.json({ detail: "Provide at least one genre or a mood." }, { status: 400 });
    }

    const results = recommendAnime({
      genres,
      mood,
      era: typeof body.era === "string" ? body.era : "any",
      min_rating: typeof body.min_rating === "number" ? body.min_rating : 6.0,
      top_n: typeof body.top_n === "number" ? body.top_n : 9,
    });

    if (!results.length) {
      return NextResponse.json({ detail: "No anime found. Try different filters." }, { status: 404 });
    }
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ detail: e instanceof Error ? e.message : "Recommendation failed" }, { status: 500 });
  }
}
