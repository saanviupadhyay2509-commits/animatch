export const BIRD_MESSAGES = {
  idle: [
    "hi there~ ✿",
    "take your time exploring",
    "so many good ones in here",
    "*ruffles feathers*",
  ],
  results: [
    "ooh, nice picks!",
    "these look good",
    "found some gems for you",
    "happy watching!",
  ],
  favorite_add: [
    "great choice! 💛",
    "ooh, a classic pick",
    "saving that for later, nice",
    "your list is looking good",
  ],
  favorite_remove: [
    "okay, taking that off the list",
    "no worries~",
  ],
  genre_horror: [
    "ooh, spooky one... *hides behind wing*",
    "brave choice!",
    "don't watch that one alone~",
  ],
  genre_romance: [
    "aww, a romance fan",
    "grab the tissues, just in case",
  ],
  genre_comedy: [
    "this one should be fun!",
    "hehe, good pick",
  ],
  genre_action: [
    "let's go!! 🔥",
    "buckle up for this one",
  ],
  mood_cry: [
    "have the tissues ready...",
    "this might be an emotional one 🥹",
  ],
  mood_spooky: [
    "*nervous chirp* okay...",
    "lights on for this one, maybe?",
  ],
  mood_hype: [
    "yesss let's gooo",
    "this is gonna be epic",
  ],
  title_search: [
    "oh, I know that one!",
    "great taste",
    "let's see what we found",
  ],
  no_results: [
    "hmm, nothing matched... try something else?",
    "let's try a different search~",
  ],
  long_hover: [
    "thinking about this one?",
    "that one's pretty good, just saying",
  ],
};

export type BirdMessageKey = keyof typeof BIRD_MESSAGES;

export function randomBirdMessage(key: BirdMessageKey): string {
  const list = BIRD_MESSAGES[key];
  return list[Math.floor(Math.random() * list.length)];
}
