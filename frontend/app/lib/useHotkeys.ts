"use client";

import { useEffect } from "react";

export type HotkeyHandler = (e: KeyboardEvent) => void;

/** True when the user is typing into a field — most single-key shortcuts should no-op here. */
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

interface Options {
  /** Fire even while a text field is focused (used for Escape / ⌘K). */
  allowInInput?: boolean;
  enabled?: boolean;
}

/**
 * Bind a single global keyboard shortcut.
 *
 * `combo` examples: "mod+k", "/", "Escape", "f", "shift+r".
 * `mod` maps to ⌘ on macOS and Ctrl elsewhere.
 */
export function useHotkey(combo: string, handler: HotkeyHandler, opts: Options = {}) {
  const { allowInInput = false, enabled = true } = opts;

  useEffect(() => {
    if (!enabled) return;

    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needMod = parts.includes("mod");
    const needShift = parts.includes("shift");

    function onKey(e: KeyboardEvent) {
      if (!allowInInput && isTypingTarget(e.target)) return;

      const pressedMod = e.metaKey || e.ctrlKey;
      if (needMod !== pressedMod) return;
      if (needShift !== e.shiftKey) return;

      const k = e.key.toLowerCase();
      const matches = k === key || (key === "escape" && k === "escape");
      if (!matches) return;

      e.preventDefault();
      handler(e);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combo, handler, allowInInput, enabled]);
}

/** Platform-aware label for the modifier key, for rendering in the UI. */
export function modLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl";
}
