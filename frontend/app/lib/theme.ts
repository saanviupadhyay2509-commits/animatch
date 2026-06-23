// ── Living Spectrum theme system ──
// The page scrolls through three "zones" (night → dusk → dawn). The active
// palette is interpolated from scroll progress and written to CSS variables as
// raw "r g b" triples, so every component can tint itself with the modern
// rgb(var(--x) / a) syntax. The user can swap the whole journey via presets.

export interface Zone {
  bg: string;       // page background base
  surface: string;  // raised glass panels
  accent: string;   // primary accent
  accent2: string;  // secondary accent (gradients)
  text: string;     // primary text
}

export interface Preset {
  id: string;
  name: string;
  swatch: string;          // representative colour for the picker dot
  zones: [Zone, Zone, Zone];
}

export const PRESETS: Preset[] = [
  {
    id: "aurora",
    name: "Aurora",
    swatch: "#8b5cf6",
    zones: [
      { bg: "#080b16", surface: "#141b2e", accent: "#6e8efb", accent2: "#4a6cf7", text: "#e8ecf7" }, // night
      { bg: "#120e22", surface: "#241a3a", accent: "#b06ef5", accent2: "#8b5cf6", text: "#efe8f9" }, // dusk
      { bg: "#1a1410", surface: "#2e2418", accent: "#f5a96e", accent2: "#e8c07a", text: "#f9f1e4" }, // dawn
    ],
  },
  {
    id: "sunset",
    name: "Sunset",
    swatch: "#ff5c6c",
    zones: [
      { bg: "#140912", surface: "#281426", accent: "#ff7a9c", accent2: "#ff5c8a", text: "#f9e8ef" },
      { bg: "#1c0a0e", surface: "#341622", accent: "#ff5c6c", accent2: "#ff8a5c", text: "#f9e9e6" },
      { bg: "#190f06", surface: "#2e1f0e", accent: "#ffb454", accent2: "#ff8a3c", text: "#f9f0df" },
    ],
  },
  {
    id: "sakura",
    name: "Sakura",
    swatch: "#e89ac0",
    zones: [
      { bg: "#0d0b11", surface: "#1c1622", accent: "#d98aa8", accent2: "#c47a98", text: "#f2e9ee" },
      { bg: "#160f1a", surface: "#281a30", accent: "#e89ac0", accent2: "#d98ab0", text: "#f6eef2" },
      { bg: "#181214", surface: "#2c1f24", accent: "#f2b8c6", accent2: "#e89ac0", text: "#f9eff1" },
    ],
  },
  {
    id: "matrix",
    name: "Matrix",
    swatch: "#3ddc84",
    zones: [
      { bg: "#050907", surface: "#0e1813", accent: "#3ddc84", accent2: "#2fb96a", text: "#d6f5e3" },
      { bg: "#06110b", surface: "#102117", accent: "#2fe07a", accent2: "#3ddc84", text: "#dcf7e8" },
      { bg: "#091410", surface: "#13261d", accent: "#7ef5a0", accent2: "#4fe08a", text: "#e6f9ec" },
    ],
  },
  {
    id: "mono",
    name: "Noir",
    swatch: "#d0d0da",
    zones: [
      { bg: "#0a0a0c", surface: "#16161b", accent: "#b8b8c6", accent2: "#9a9aa8", text: "#ededf2" },
      { bg: "#121216", surface: "#222229", accent: "#d0d0da", accent2: "#b8b8c6", text: "#f2f2f6" },
      { bg: "#1a1a1f", surface: "#2a2a32", accent: "#e8e8ef", accent2: "#d0d0da", text: "#f7f7fa" },
    ],
  },
];

export interface Resolved {
  bg: string; surface: string; accent: string; accent2: string; text: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `${Math.round(lerp(r1, r2, t))} ${Math.round(lerp(g1, g2, t))} ${Math.round(lerp(b1, b2, t))}`;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Sample a preset at scroll progress p ∈ [0,1] across its three zones. */
export function samplePreset(preset: Preset, p: number): Resolved {
  const t = clamp01(p);
  const [z0, z1, z2] = preset.zones;
  // first half blends z0→z1, second half z1→z2
  const [from, to, seg] = t < 0.5 ? [z0, z1, t / 0.5] : [z1, z2, (t - 0.5) / 0.5];
  const e = seg * seg * (3 - 2 * seg); // smoothstep for buttery transitions
  return {
    bg:      mix(from.bg, to.bg, e),
    surface: mix(from.surface, to.surface, e),
    accent:  mix(from.accent, to.accent, e),
    accent2: mix(from.accent2, to.accent2, e),
    text:    mix(from.text, to.text, e),
  };
}

export function getPreset(id: string): Preset {
  return PRESETS.find(p => p.id === id) ?? PRESETS[0];
}

export const ZONE_LABELS = ["night", "dusk", "dawn"] as const;

/** Which zone label is dominant at progress p — used for ambient UI copy. */
export function zoneLabel(p: number): string {
  return p < 0.34 ? "night" : p < 0.67 ? "dusk" : "dawn";
}
