"use client";

// Tiny event bus so any component can make the bird speak
// without prop-drilling through the whole tree.

import type { BirdMessageKey } from "./birdMessages";

type Listener = (key: BirdMessageKey) => void;

let listener: Listener | null = null;

export function registerBird(fn: Listener) {
  listener = fn;
}

export function birdSay(key: BirdMessageKey) {
  listener?.(key);
}
