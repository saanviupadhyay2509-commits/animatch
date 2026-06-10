import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

// Must match exactly what the dataset contains
const VALID_GENRES = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary",
  "Drama","Family","Fantasy","History","Horror","Music","Mystery",
  "Romance","Sci-Fi","Sport","Thriller",
];

const MOOD_GENRE_MAP: Record<string, string[]> = {
  hype    : ["Action", "Adventure", "Sport"],
  cry     : ["Drama", "Romance", "Family"],
  romance : ["Romance", "Drama", "Comedy"],
  spooky  : ["Horror", "Thriller", "Mystery"],
  chill   : ["Comedy", "Family"],
};

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content: "You are a JSON-only API. Output only valid JSON, no markdown, no explanation.",
          },
          {
            role: "user",
            content: `Parse this anime request into filters. Return ONLY raw JSON.

Valid genres (use exact spelling): ${VALID_GENRES.join(", ")}
Valid moods: hype, cry, romance, spooky, chill, or null
Valid eras: any, classic, nineties, two-thousands, twenty-tens, recent
min_rating: number 0-10, default 6.0

Rules:
- genres: 1-3 genres from the valid list that match the request. Never empty.
- mood: map "sad/emotional/cry" → cry, "scary/horror/dark/spooky" → spooky, "exciting/fight/action" → hype, "love/romance" → romance, "calm/relaxing/cozy" → chill
- era: only set if user mentions a time period, otherwise "any"
- min_rating: default 6.0, never above 7.0
- If unsure about genres, pick from the mood's defaults

Request: "${query}"

JSON (exactly this shape):
{"genres": [...], "mood": "...", "era": "...", "min_rating": 6.0}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data    = await response.json();
    let   content = data.choices?.[0]?.message?.content ?? "";
    content       = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Hard fallback — parse mood from query manually
      parsed = {};
    }

    // Detect mood from query text as extra safety net
    const q = query.toLowerCase();
    let detectedMood: string | null = null;
    if (/spook|horror|scar|dark|creep|eerie|ghost|demon/.test(q)) detectedMood = "spooky";
    else if (/sad|cry|emotion|tear|heartbreak|tragic/.test(q))    detectedMood = "cry";
    else if (/love|romance|romantic|couple/.test(q))              detectedMood = "romance";
    else if (/hype|fight|action|excit|intense|battle/.test(q))    detectedMood = "hype";
    else if (/chill|calm|relax|cozy|slice/.test(q))               detectedMood = "chill";

    const mood = (
      typeof parsed.mood === "string" && ["hype","cry","romance","spooky","chill"].includes(parsed.mood)
        ? parsed.mood
        : detectedMood
    ) as string | null;

    // Validate genres — filter to only valid ones
    let genres: string[] = Array.isArray(parsed.genres)
      ? (parsed.genres as string[]).filter(g => VALID_GENRES.includes(g))
      : [];

    // If genres empty, derive from mood
    if (genres.length === 0 && mood) {
      genres = MOOD_GENRE_MAP[mood] ?? ["Drama"];
    }
    if (genres.length === 0) genres = ["Drama"];

    const validEras  = ["any","classic","nineties","two-thousands","twenty-tens","recent"];
    const era        = validEras.includes(parsed.era as string) ? (parsed.era as string) : "any";
    const min_rating = Math.min(Math.max(typeof parsed.min_rating === "number" ? parsed.min_rating : 6.0, 0), 6.5);

    return NextResponse.json({ genres, mood, era, min_rating });

  } catch (error) {
    console.error("parse-query error:", error);
    return NextResponse.json(
      { genres: ["Drama"], mood: "cry", era: "any", min_rating: 6.0 },
      { status: 500 }
    );
  }
}
