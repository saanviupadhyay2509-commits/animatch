import { NextResponse } from "next/server";
import { getMeta } from "@/lib/recommend";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(getMeta());
  } catch (e) {
    return NextResponse.json({ detail: e instanceof Error ? e.message : "Meta failed" }, { status: 500 });
  }
}
