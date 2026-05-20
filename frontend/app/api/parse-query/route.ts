import { NextRequest, NextResponse } from "next/server";

const VALID_GENRES = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary",
  "Drama","Family","Fantasy","History","Horror","Music","Mystery",
  "Romance","Sci-Fi","Sport","Thriller",
];
const VALID_MOODS = ["hype","cry","romance","spooky","chill"];
const VALID_ERAS  = ["any","classic","nineties","two-thousands","twenty-tens","recent"];

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You are a filter parser for an anime recommendation app.
Given a natural language query, extract filter parameters and return ONLY a raw JSON object with no explanation, no markdown, no backticks.

Valid genres: ${VALID_GENRES.join(", ")}
Valid moods: ${VALID_MOODS.join(", ")} (or null)
Valid eras: ${VALID_ERAS.join(", ")}
min_rating: a number between 1.0 and 9.5

Return exactly this shape:
{"genres": [...], "mood": "..." or null, "era": "...", "min_rating": number}

Rules:
- genres must be an array of 1-3 items from the valid genres list only
- if the user mentions crying, sadness, emotional → mood: "cry"
- if the user mentions hype, exciting, intense, fights → mood: "hype"
- if the user mentions scary, horror, dark → mood: "spooky"
- if the user mentions relaxing, calm, slice of life → mood: "chill"
- if the user mentions romance, love → mood: "romance"
- if the user says "not too old", "recent", "modern" → era: "recent"
- if the user says "2010s" → era: "twenty-tens"
- if the user says "classic", "old school" → era: "classic"
- if no era preference → era: "any"
- if the user wants quality or high rated → min_rating: 7.5, otherwise 6.5
- return ONLY the JSON object, nothing else`,
        },
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse response", raw: text },
      { status: 500 }
    );
  }
}
