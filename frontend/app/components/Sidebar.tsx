"use client";

import { Home, Compass, Sparkles, Bookmark, Clock, Info, Settings, Cat } from "lucide-react";

export interface NavKey {
  key: string;
  label: string;
}

const ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "discover", label: "Discover", icon: Compass },
  { key: "recs", label: "Recommendations", icon: Sparkles },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "history", label: "History", icon: Clock },
  { key: "about", label: "About", icon: Info },
  { key: "settings", label: "Settings", icon: Settings },
];

interface Props {
  active: string;
  onNavigate: (key: string) => void;
  savedCount: number;
}

export function Sidebar({ active, onNavigate, savedCount }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[244px] px-4 py-6 z-30"
        style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}
      >
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 px-2 mb-8">
          <span className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: "var(--accent)" }}>
            <Cat className="w-[18px] h-[18px] text-white" />
          </span>
          <span className="font-display text-[17px] font-600" style={{ color: "var(--text)", fontWeight: 600, letterSpacing: "-0.03em" }}>
            AniMatch
          </span>
        </button>

        <nav className="flex flex-col gap-1">
          {ITEMS.map(({ key, label, icon: Icon }) => (
            <button key={key} className="nav-item" data-active={active === key} onClick={() => onNavigate(key)}>
              <Icon className="nav-ico w-[18px] h-[18px]" style={{ color: "var(--text-subtle)" }} />
              <span className="flex-1">{label}</span>
              {key === "saved" && savedCount > 0 && (
                <span className="text-[11px] tnum px-1.5 py-0.5 rounded-md" style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
                  {savedCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-2">
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-subtle)" }}>
            AI-Powered Anime Discovery
          </p>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2"
        style={{ background: "rgba(19,19,22,0.92)", borderTop: "1px solid var(--border)", backdropFilter: "blur(16px)" }}
      >
        {ITEMS.slice(0, 5).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg"
            style={{ color: active === key ? "var(--accent)" : "var(--text-subtle)" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
