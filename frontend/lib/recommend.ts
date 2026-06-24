// Server-only. A faithful TypeScript port of the trained AniMatch model
// (recommender.py): the exact TF-IDF vectors, K-Means centroids and Ridge
// weights exported from the notebook, so the deployed app runs the real model
// with no external Python backend.
import fs from "fs";
import path from "path";
import type { AnimeResult, SiteMeta } from "./api";

interface RawTitle {
  t: string; g: string; r: number | null; y: number | null; v: number | null;
  e: string; c: number; cl: string; rn: number; pop: number; gl: string; sl: string; s: string;
  vec: [number, number][];
}
interface Model {
  meta: SiteMeta;
  V: number; K: number;
  vocab: Record<string, number>;
  idf: number[];
  centroids: number[][];
  centroid_norms: number[];
  ridge_coef: number[];
  ridge_intercept: number;
  titles: RawTitle[];
}

let _model: Model | null = null;
function M(): Model {
  if (!_model) {
    const raw = fs.readFileSync(path.join(process.cwd(), "lib", "model.json"), "utf8");
    _model = JSON.parse(raw) as Model;
  }
  return _model;
}

const MOOD_MAP: Record<string, string[]> = {
  hype: ["action", "adventure", "sport"],
  cry: ["drama", "romance", "family"],
  romance: ["romance", "drama", "comedy"],
  spooky: ["horror", "thriller", "mystery"],
  chill: ["comedy", "slice of life", "family"],
};
const MOOD_TERMS: Record<string, string[]> = {
  cry: ["sad", "emotional", "tragic", "loss", "heartbreak", "tears"],
  romance: ["love", "romance", "couple", "relationship"],
  hype: ["fight", "battle", "power", "hero", "tournament", "war"],
  spooky: ["horror", "death", "ghost", "demon", "curse", "killer", "murder"],
  chill: ["calm", "friendship", "school", "daily", "slice of life"],
};
const TITLE_ALIASES: Record<string, string> = {
  "attack on titan": "shingeki no kyojin",
  "demon slayer": "kimetsu no yaiba",
  "jujutsu kaisen": "jujutsu kaisen",
  "jujutsu": "jujutsu kaisen",
  "my hero academia": "boku no hero academia",
  "spy x family": "spy x family",
  "one punch man": "one punch man",
  "sword art online": "sword art online",
  "fullmetal alchemist": "hagane no renkinjutsushi",
  "haikyu": "haikyuu",
  "tokyo revengers": "tokyo revengers",
  "chainsaw man": "chainsaw man",
};

// Replicates TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True, norm='l2').transform
function queryVector(queryStr: string): Map<number, number> {
  const m = M();
  const tokens = queryStr.toLowerCase().match(/\b\w\w+\b/g) || [];
  const grams: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    grams.push(tokens[i]);
    if (i + 1 < tokens.length) grams.push(tokens[i] + " " + tokens[i + 1]);
  }
  const counts = new Map<number, number>();
  for (const g of grams) {
    const idx = m.vocab[g];
    if (idx !== undefined) counts.set(idx, (counts.get(idx) ?? 0) + 1);
  }
  const vec = new Map<number, number>();
  let norm = 0;
  for (const [idx, cnt] of counts) {
    const w = (1 + Math.log(cnt)) * m.idf[idx];
    vec.set(idx, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [idx, w] of vec) vec.set(idx, w / norm);
  return vec;
}

function predictCluster(qvec: Map<number, number>): number {
  const m = M();
  let best = 0, bestDist = Infinity;
  for (let k = 0; k < m.K; k++) {
    let dot = 0;
    for (const [idx, val] of qvec) dot += val * m.centroids[k][idx];
    const dist = 1 - 2 * dot + m.centroid_norms[k]; // ||q-c||^2, q is L2-normalized
    if (dist < bestDist) { bestDist = dist; best = k; }
  }
  return best;
}

function cosine(qvec: Map<number, number>, titleVec: [number, number][]): number {
  let s = 0;
  for (const [idx, val] of titleVec) {
    const q = qvec.get(idx);
    if (q !== undefined) s += q * val;
  }
  return s;
}

function ridgePredict(titleVec: [number, number][], cluster: number): number {
  const m = M();
  let s = m.ridge_intercept;
  for (const [idx, val] of titleVec) s += m.ridge_coef[idx] * val;
  s += m.ridge_coef[m.V + cluster];
  return Math.min(10, Math.max(0, s));
}

function build(t: RawTitle, match: number, sim: number, pred: number, matched: string[], total: number, titleMatch = false): AnimeResult {
  return {
    title: t.t,
    genre: t.g,
    rating: t.r ?? 0,
    predicted_rating: Math.round(pred * 10) / 10,
    year: t.y,
    votes: t.v,
    era: t.e,
    match_score: Math.round(match * 10000) / 10000,
    similarity: Math.round(sim * 10000) / 10000,
    summary: t.s || null,
    matched_filters: matched,
    total_filters: total,
    cluster_label: t.cl,
    is_title_match: titleMatch,
  };
}

export interface RecommendInput {
  genres?: string[]; min_rating?: number; era?: string; mood?: string | null; top_n?: number;
}

export function recommendAnime(input: RecommendInput): AnimeResult[] {
  const m = M();
  const titles = m.titles;
  let genres = input.genres ?? [];
  const minRating = Math.min(input.min_rating ?? 6.0, 6.5);
  const era = input.era ?? "any";
  const mood = input.mood ? input.mood.toLowerCase() : null;
  const topN = input.top_n ?? 9;

  if (genres.length === 0 && mood && MOOD_MAP[mood]) {
    genres = MOOD_MAP[mood].map(g => g.replace(/\b\w/, c => c.toUpperCase()));
  }

  const queryParts = genres.map(g => g.toLowerCase());
  if (era && era !== "any") queryParts.push(era);
  if (mood && MOOD_MAP[mood]) queryParts.push(...MOOD_MAP[mood]);
  const queryStr = queryParts.join(" ") || "anime";

  const qvec = queryVector(queryStr);
  const queryCluster = predictCluster(qvec);

  const genreSet = genres.map(g => g.toLowerCase());
  const overlapCount = (gl: string) => genreSet.reduce((n, g) => n + (gl.includes(g) ? 1 : 0), 0);

  // candidate masks (boolean predicates)
  const baseOk = (t: RawTitle) => (t.r ?? 0) >= minRating;
  const eraOk = (t: RawTitle) => era === "any" || t.e === era;
  const clOk = (t: RawTitle) => t.c === queryCluster;
  const genreOk = (t: RawTitle) => genreSet.length === 0 || overlapCount(t.gl) > 0;

  const masks: ((t: RawTitle) => boolean)[] = [
    t => baseOk(t) && eraOk(t) && clOk(t) && genreOk(t),
    t => baseOk(t) && clOk(t) && genreOk(t),
    t => baseOk(t) && eraOk(t) && genreOk(t),
    t => baseOk(t) && genreOk(t),
    t => baseOk(t) && eraOk(t),
    t => baseOk(t),
    () => true,
  ];

  let candidates: RawTitle[] = [];
  for (const mask of masks) {
    const c = titles.filter(mask);
    if (c.length >= topN) { candidates = c; break; }
  }
  if (candidates.length === 0) candidates = titles;

  const moodTerms = mood ? (MOOD_TERMS[mood] ?? []) : [];
  const nGenres = Math.max(genres.length, 1);

  const scored = candidates.map(t => {
    const cos = cosine(qvec, t.vec);
    const pred = ridgePredict(t.vec, t.c);
    const predNorm = pred / 10;
    const clusterBonus = t.c === queryCluster ? 1 : 0;
    const overlapBonus = genreSet.length ? Math.min(1, overlapCount(t.gl) / nGenres) : 0;
    const moodBonus = moodTerms.length && moodTerms.some(term => t.sl.includes(term)) ? 1 : 0;
    const score =
      0.35 * cos +
      0.20 * clusterBonus +
      0.15 * overlapBonus +
      0.15 * predNorm +
      0.10 * t.rn +
      0.05 * moodBonus;
    return { t, score, cos, pred };
  });

  scored.sort((a, b) => b.score - a.score);

  const moodGenres = mood ? (MOOD_MAP[mood] ?? []) : [];
  const total = genres.length + (era && era !== "any" ? 1 : 0) + (mood ? 1 : 0);

  const out: AnimeResult[] = [];
  const seen = new Set<string>();
  for (const { t, score, cos, pred } of scored.slice(0, topN * 4)) {
    if (seen.has(t.t)) continue;
    seen.add(t.t);
    const gl = t.gl;
    const matched: string[] = genres.filter(g => gl.includes(g.toLowerCase()));
    if (era && era !== "any" && t.e === era) matched.push(era);
    if (mood && moodGenres.some(mg => gl.includes(mg))) matched.push(mood);
    out.push(build(t, score, cos, pred, matched, total));
    if (out.length >= topN) break;
  }
  return out;
}

export function searchByTitle(query: string, topN = 9): AnimeResult[] {
  const m = M();
  const titles = m.titles;
  let q = query.toLowerCase().trim();
  if (TITLE_ALIASES[q]) q = TITLE_ALIASES[q];

  const titleLower = (t: RawTitle) => t.t.toLowerCase().trim();

  let matches = titles.filter(t => titleLower(t) === q);
  if (matches.length === 0) matches = titles.filter(t => titleLower(t).includes(q));
  if (matches.length === 0) matches = titles.filter(t => { const tl = titleLower(t); return tl.length > 2 && q.includes(tl); });

  if (matches.length === 0) {
    const qWords = new Set(q.split(/\s+/).filter(w => w.length > 2));
    if (qWords.size) {
      const scoredOverlap = titles
        .map(t => {
          const tw = new Set(titleLower(t).split(/\s+/).filter(w => w.length > 2));
          let overlap = 0;
          for (const w of qWords) if (tw.has(w)) overlap++;
          return { t, overlap };
        })
        .filter(x => x.overlap >= Math.max(1, Math.floor(qWords.size / 2)))
        .sort((a, b) => b.overlap - a.overlap);
      matches = scoredOverlap.map(x => x.t);
    }
  }

  if (matches.length === 0) return [];

  const anchor = matches.slice().sort((a, b) => (b.r ?? 0) - (a.r ?? 0))[0];
  const anchorPred = ridgePredict(anchor.vec, anchor.c);
  const out: AnimeResult[] = [build(anchor, 1, 1, anchorPred, ["title match"], 1, true)];
  if (topN <= 1) return out;

  const anchorGenres = anchor.g.split(",").map(g => g.trim()).filter(Boolean);
  const similar = recommendAnime({ genres: anchorGenres, min_rating: 5.0, top_n: topN + 1 });
  for (const r of similar) {
    if (r.title.toLowerCase() !== anchor.t.toLowerCase()) out.push(r);
    if (out.length >= topN) break;
  }
  return out;
}

export function getMeta(): SiteMeta {
  return M().meta;
}
