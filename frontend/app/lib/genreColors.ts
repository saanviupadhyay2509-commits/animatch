export function genreClass(genre: string): string {
  const g = genre.trim().toLowerCase();
  const map: Record<string, string> = {
    "action"    : "genre-action",
    "adventure" : "genre-adventure",
    "animation" : "genre-animation",
    "comedy"    : "genre-comedy",
    "crime"     : "genre-crime",
    "drama"     : "genre-drama",
    "family"    : "genre-family",
    "fantasy"   : "genre-fantasy",
    "horror"    : "genre-horror",
    "mystery"   : "genre-mystery",
    "romance"   : "genre-romance",
    "sci-fi"    : "genre-scifi",
    "sport"     : "genre-sport",
    "thriller"  : "genre-thriller",
  };
  return map[g] ?? "genre-default";
}
