import { NextRequest, NextResponse } from "next/server";
import { searchByTitle } from "@/lib/recommend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query : "";
    if (!query.trim()) return NextResponse.json({ detail: "Missing query" }, { status: 400 });

    const results = searchByTitle(query, typeof body.top_n === "number" ? body.top_n : 9);
    if (!results.length) {
      return NextResponse.json({ detail: `No anime found matching '${query}'.` }, { status: 404 });
    }
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ detail: e instanceof Error ? e.message : "Search failed" }, { status: 500 });
  }
}
