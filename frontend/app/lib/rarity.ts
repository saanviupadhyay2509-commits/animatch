import type { AnimeResult } from "@/lib/api";

export type Tier = "SSR" | "SR" | "R";

export interface Rarity {
  tier: Tier;
  label: string;       // pretty label
  stars: number;       // 1..5 for the star row
  ribbon: string;      // css class for ribbon gradient
  textClass: string;   // css class for glowing rarity text
}

/** Map an anime's rating + match quality onto a gacha rarity tier. */
export function rarityOf(a: AnimeResult): Rarity {
  const rating = a.rating || a.predicted_rating || 0;
  const matched = a.total_filters ? (a.matched_filters?.length ?? 0) / a.total_filters : 0;

  let tier: Tier = "R";
  if (rating >= 8 || (rating >= 7.4 && matched >= 0.75)) tier = "SSR";
  else if (rating >= 6.8 || matched >= 0.6) tier = "SR";

  const stars = Math.max(1, Math.min(5, Math.round(rating / 2)));

  if (tier === "SSR") return { tier, label: "ULTRA RARE", stars, ribbon: "ribbon-ssr", textClass: "rarity-ssr" };
  if (tier === "SR")  return { tier, label: "SUPER RARE", stars, ribbon: "ribbon-sr",  textClass: "rarity-sr" };
  return { tier, label: "RARE", stars, ribbon: "ribbon-r", textClass: "rarity-r" };
}
