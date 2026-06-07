"use client";

import { useEffect, useState } from "react";

export function Hero({ totalAnime }: { totalAnime: number }) {
  const [typed, setTyped] = useState("");
  const fullText = "find me something good";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative px-6 pt-32 pb-20 text-center">
      <div className="max-w-3xl mx-auto">
        {/* ASCII border - very human */}
        <pre className="text-[#e04f5f]/30 text-xs mb-6 font-mono select-none">
{`┌────────────────────────────────────────┐
│                                          │`}
        </pre>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">
          <span className="bg-gradient-to-r from-[#e04f5f] to-[#5b7c99] bg-clip-text text-transparent">
            ani
          </span>
          <span className="text-white">match</span>
        </h1>

        {/* Terminal-style subtitle */}
        <div className="font-mono text-sm text-white/40 mb-8">
          <span className="text-[#e04f5f]">$</span> {typed}
          <span className="animate-pulse">_</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#e04f5f] animate-pulse" />
          {totalAnime.toLocaleString()} titles indexed
        </div>

        <pre className="text-[#e04f5f]/20 text-xs mt-8 font-mono select-none">
{`│                                          │
└────────────────────────────────────────┘`}
        </pre>
      </div>
    </section>
  );
}