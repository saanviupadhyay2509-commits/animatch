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
    id: "sakura",
    name: "Sakura",
    swatch: "#ff9ec7",
    zones: [
      { bg: "#0e0a1a", surface: "#1d1530", accent: "#ff9ec7", accent2: "#c79bff", text: "#f8ecf6" }, // night
      { bg: "#160a1e", surface: "#291640", accent: "#ff8ad4", accent2: "#b07bff", text: "#f9ecf6" }, // dusk
      { bg: "#1c0e16", surface: "#341a28", accent: "#ffb37a", accent2: "#ff8ab0", text: "#fbeee9" }, // dawn
    ],
  },
  {
    id: "magical",
    name: "Magical",
    swatch: "#b88aff",
    zones: [
      { bg: "#0a0f22", surface: "#161d3a", accent: "#7ee8ff", accent2: "#b18cff", text: "#e9f0fb" },
      { bg: "#120a26", surface: "#241642", accent: "#b88aff", accent2: "#ff8ae0", text: "#f1ebfb" },
      { bg: "#1a0a1e", surface: "#311640", accent: "#ff8ad0", accent2: "#ffb0e0", text: "#fbecf6" },
    ],
  },
  {
    id: "ramune",
    name: "Ramune",
    swatch: "#5fe0e8",
    zones: [
      { bg: "#07121e", surface: "#0f2230", accent: "#7ef0ff", accent2: "#8affc0", text: "#e6f6fb" },
      { bg: "#08161e", surface: "#102633", accent: "#5fe0e8", accent2: "#9affd0", text: "#e6f8f8" },
      { bg: "#0a1620", surface: "#132a32", accent: "#aef0a0", accent2: "#7ee8ff", text: "#ecf9ec" },
    ],
  },
  {
    id: "ember",
    name: "Ember",
    swatch: "#ff8a5c",
    zones: [
      { bg: "#160a0a", surface: "#2c1414", accent: "#ff8a5c", accent2: "#ffd05c", text: "#fbeae4" },
      { bg: "#1a0a08", surface: "#321612", accent: "#ff6a4c", accent2: "#ffa84c", text: "#fbe9e2" },
      { bg: "#1c0e06", surface: "#341f0e", accent: "#ffc24c", accent2: "#ff7a4c", text: "#fbf0df" },
    ],
  },
  {
    id: "starlight",
    name: "Starlight",
    swatch: "#cfd6ff",
    zones: [
      { bg: "#08091a", surface: "#141633", accent: "#cfd6ff", accent2: "#f5d98a", text: "#eceefb" },
      { bg: "#0c0a1e", surface: "#1b1640", accent: "#b8a0ff", accent2: "#ffd9a0", text: "#efebfb" },
      { bg: "#10091a", surface: "#241640", accent: "#f5c2e0", accent2: "#cfd6ff", text: "#fbecf6" },
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
