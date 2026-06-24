import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const VALID_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Sci-Fi", "Sport", "Thriller",
];

const MOOD_GENRE_MAP: Record<string, string[]> = {
  hype: ["Action", "Adventure", "Sport"],
  cry: ["Drama", "Romance", "Family"],
  romance: ["Romance", "Drama", "Comedy"],
  spooky: ["Horror", "Thriller", "Mystery"],
  chill: ["Comedy", "Family"],
};

// Keyword → genre. Ordered so earlier, more specific cues win when we trim to 3.
const GENRE_KEYWORDS: [string, RegExp][] = [
  ["Horror", /\b(horror|scary|terrifying|gore|zombie|creepy|eerie|nightmare)\b/],
  ["Romance", /\b(romance|romantic|love|couple|relationship|shoujo|dating|crush)\b/],
  ["Mystery", /\b(mystery|mysterious|detective|psychological|twist|twists|whodunit|investigat|puzzle|enigma)\b/],
  ["Thriller", /\b(thriller|suspense|intense|tense|gripping|edge|on the edge)\b/],
  ["Sci-Fi", /\b(sci-?fi|science fiction|space|mecha|robot|cyberpunk|futur|dystop|aliens?|technology)\b/],
  ["Fantasy", /\b(fantasy|magic|magical|supernatural|demon|dragon|witch|isekai|sword|sorcer|world-?building)\b/],
  ["Action", /\b(action|fight|fighting|battle|shounen|martial|combat|war|warrior|epic)\b/],
  ["Adventure", /\b(adventure|journey|quest|explore|exploration|pirate|treasure)\b/],
  ["Sport", /\b(sport|sports|soccer|football|basketball|baseball|volleyball|tennis|athlet|racing)\b/],
  ["Comedy", /\b(comedy|comedic|funny|hilarious|gag|light-?hearted|light hearted|fun|silly|wholesome)\b/],
  ["Crime", /\b(crime|heist|yakuza|mafia|gangster|noir|underworld)\b/],
  ["Music", /\b(music|musical|idol|band|song|concert)\b/],
  ["History", /\b(historical|history|samurai|edo|feudal|period piece|medieval)\b/],
  ["Family", /\b(family|kids|children|heartwarming)\b/],
  ["Drama", /\b(drama|dramatic|emotional|tearjerker|moving|deep|mature|slice of life|slice-of-life|coming of age|melancholy)\b/],
];

const ERA_KEYWORDS: [string, RegExp][] = [
  ["recent", /\b(recent|modern|latest|new|nowadays|2020s|currently airing)\b/],
  ["twenty-tens", /\b(2010s|twenty tens)\b/],
  ["two-thousands", /\b(2000s|early 2000s)\b/],
  ["nineties", /\b(90s|nineties|1990s)\b/],
  ["classic", /\b(classic|retro|old|old-?school|vintage|80s|eighties|1980s)\b/],
];

function detectMood(q: string): string | null {
  if (/\b(spook|horror|scar|dark|creep|eerie|ghost|demon|disturbing)\b/.test(q)) return "spooky";
  if (/\b(sad|cry|emotion|tear|heartbreak|tragic|melanchol|grief)\b/.test(q)) return "cry";
  if (/\b(love|romance|romantic|couple|wholesome relationship)\b/.test(q)) return "romance";
  if (/\b(hype|fight|action|excit|intense|battle|adrenaline|epic)\b/.test(q)) return "hype";
  if (/\b(chill|calm|relax|cozy|comfort|slice of life|light-?hearted|stressful)\b/.test(q)) return "chill";
  return null;
}

/** Fully local parser — no external API needed. */
function heuristicParse(query: string) {
  const q = query.toLowerCase();
  const mood = detectMood(q);

  const genres: string[] = [];
  for (const [genre, re] of GENRE_KEYWORDS) {
    if (re.test(q) && !genres.includes(genre)) genres.push(genre);
    if (genres.length >= 3) break;
  }
  let finalGenres = genres;
  if (finalGenres.length === 0) finalGenres = mood ? MOOD_GENRE_MAP[mood] : ["Drama"];

  let era = "any";
  for (const [e, re] of ERA_KEYWORDS) { if (re.test(q)) { era = e; break; } }

  const min_rating = /\b(best|top|highly rated|acclaimed|masterpiece|greatest|must-?watch|peak)\b/.test(q) ? 6.5 : 6.0;

  return { genres: finalGenres.slice(0, 3), mood, era, min_rating, title_search: null };
}

export async function POST(req: NextRequest) {
  let query = "";
  try {
    const body = await req.json();
    query = typeof body.query === "string" ? body.query : "";
    if (!query.trim()) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const local = heuristicParse(query);

    // If a Groq key is configured, refine genres with the LLM; otherwise the
    // local parser already returns a complete, valid result.
    if (!GROQ_API_KEY) return NextResponse.json(local);

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 200,
        messages: [
          { role: "system", content: "You are a JSON-only API. Output only valid JSON, no markdown." },
          {
            role: "user",
            content: `Parse this anime request into filters. Return ONLY raw JSON.
Valid genres (exact spelling): ${VALID_GENRES.join(", ")}
Valid moods: hype, cry, romance, spooky, chill, or null
Valid eras: any, classic, nineties, two-thousands, twenty-tens, recent
Rules: genres 1-3 from the list (never empty); era only if a time period is mentioned; min_rating default 6.0, never above 7.0.
Request: "${query}"
JSON: {"genres": [...], "mood": "...", "era": "...", "min_rating": 6.0}`,
          },
        ],
      }),
    });
    if (!response.ok) return NextResponse.json(local);

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content ?? "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(content); } catch { return NextResponse.json(local); }

    const genres = Array.isArray(parsed.genres)
      ? (parsed.genres as string[]).filter(g => VALID_GENRES.includes(g))
      : [];
    const mood = (typeof parsed.mood === "string" && ["hype", "cry", "romance", "spooky", "chill"].includes(parsed.mood))
      ? (parsed.mood as string) : local.mood;
    const validEras = ["any", "classic", "nineties", "two-thousands", "twenty-tens", "recent"];
    const era = validEras.includes(parsed.era as string) ? (parsed.era as string) : local.era;
    const min_rating = Math.min(Math.max(typeof parsed.min_rating === "number" ? parsed.min_rating : 6.0, 0), 6.5);

    return NextResponse.json({
      genres: genres.length ? genres : local.genres,
      mood, era, min_rating, title_search: null,
    });
  } catch {
    // Never fail the search — fall back to the local parse.
    return NextResponse.json(query ? heuristicParse(query) : { genres: ["Drama"], mood: null, era: "any", min_rating: 6.0, title_search: null });
  }
}
