export const BIRD_MESSAGES = {
  idle: [
    "hehe~ hi! ✦",
    "take your time, friend",
    "so many treasures in here…",
    "*floats happily*",
    "wanna summon something? ♪",
  ],
  results: [
    "ooh, shiny pulls! ✨",
    "these ones sparkle!",
    "found some gems for you~",
    "happy watching! 💕",
  ],
  favorite_add: [
    "added to your collection! ⭐",
    "ooh, a keeper~",
    "great taste, friend!",
    "your shelf is glowing 💛",
  ],
  favorite_remove: [
    "okay, releasing that one~",
    "no worries! ♪",
  ],
  genre_horror: [
    "eek… spooky one… *hides*",
    "b-brave choice!",
    "don't watch alone, okay~?",
  ],
  genre_romance: [
    "aww, a romantic ♡",
    "grab the tissues, just in case",
  ],
  genre_comedy: [
    "this'll be a fun one!",
    "hehe, good pick~",
  ],
  genre_action: [
    "let's gooo!! 🔥",
    "buckle up, friend!",
  ],
  mood_cry: [
    "tissues ready…? 🥹",
    "an emotional summon, brave",
  ],
  mood_spooky: [
    "*nervous sparkle* o-okay…",
    "lights on, maybe?",
  ],
  mood_hype: [
    "yesss let's gooo ⚡",
    "this'll be epic!",
  ],
  title_search: [
    "oh! I know that one~",
    "great taste, friend",
    "let's see what we find ✦",
  ],
  no_results: [
    "hmm… nothing matched… try again?",
    "let's wish for something else~",
  ],
  long_hover: [
    "thinking about that one? ♪",
    "that one's pretty good, just saying~",
  ],
};

export type BirdMessageKey = keyof typeof BIRD_MESSAGES;

export function randomBirdMessage(key: BirdMessageKey): string {
  const list = BIRD_MESSAGES[key];
  return list[Math.floor(Math.random() * list.length)];
}
