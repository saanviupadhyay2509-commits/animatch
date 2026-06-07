import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' field" },
        { status: 400 }
      );
    }

    if (!GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY environment variable");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are an anime recommendation assistant. Parse the user's request into structured filters.

IMPORTANT RULES:
1. genres: Extract specific genres mentioned. If NONE mentioned, infer from mood:
   - "sad", "emotional", "cry" → ["Drama", "Romance"]
   - "exciting", "action", "fight" → ["Action", "Adventure"]
   - "scary", "horror", "spooky" → ["Horror", "Thriller"]
   - "funny", "comedy", "laugh" → ["Comedy"]
   - "romantic", "love" → ["Romance"]
   - If still empty → ["Drama"]
2. mood: Choose from: hype, cry, romance, spooky, chill, or null
3. era: "classic" (pre-1990), "nineties" (1990-1999), "two-thousands" (2000-2009), "twenty-tens" (2010-2019), "recent" (2020+), or "any"
4. min_rating: number from 0-10. Default to 6.0

Return ONLY valid JSON. No extra text.

User request: "${query}"

JSON:`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a JSON-only API. Never include explanatory text. Output only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      return NextResponse.json(
        { error: "Failed to parse query", raw: await response.text() },
        { status: 500 }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Clean markdown fences
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse:", content);
      // Fallback to safe defaults
      parsed = { genres: ["Drama"], mood: "cry", era: "any", min_rating: 6.0 };
    }

    // Validate and sanitize
    const validGenres = Array.isArray(parsed.genres) ? parsed.genres : ["Drama"];
    const validMood = ["hype", "cry", "romance", "spooky", "chill", null].includes(parsed.mood) 
      ? parsed.mood 
      : "cry";
    const validEra = ["any", "classic", "nineties", "two-thousands", "twenty-tens", "recent"].includes(parsed.era)
      ? parsed.era
      : "any";
    let minRating = typeof parsed.min_rating === "number" ? parsed.min_rating : 6.0;
    
    // Cap rating
    minRating = Math.min(10, Math.max(0, minRating));
    
    // If no genres after everything, force Drama
    if (validGenres.length === 0) {
      validGenres.push("Drama");
    }

    return NextResponse.json({
      genres: validGenres,
      mood: validMood,
      era: validEra,
      min_rating: minRating,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", genres: ["Drama"], mood: "cry", era: "any", min_rating: 6.0 },
      { status: 500 }
    );
  }
}