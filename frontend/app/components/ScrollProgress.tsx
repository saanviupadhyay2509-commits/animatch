"use client";

import { useEffect, useRef } from "react";

/** Thin gold rail at the very top that tracks page scroll (native, rAF-throttled). */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-[55] origin-left"
      style={{
        height: "2px",
        transform: "scaleX(0)",
        transition: "transform 0.1s linear",
        background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))",
        boxShadow: "0 0 12px rgb(var(--accent) / 0.5)",
      }}
    />
  );
}
