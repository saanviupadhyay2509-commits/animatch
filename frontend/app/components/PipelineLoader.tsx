"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Understanding your preferences",
  "Analyzing genres",
  "Finding similar anime",
  "Exploring content clusters",
  "Ranking recommendations",
];

/** The signature reveal: steps light up one by one (~2.4s) before results appear. */
export function PipelineLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length)), 460);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-md mx-auto px-6 py-10 text-center">
      <h3 className="font-serif text-2xl mb-1" style={{ color: "var(--text)" }}>
        Finding something you&rsquo;ll actually love…
      </h3>
      <p className="text-[13px] mb-8" style={{ color: "var(--text-subtle)" }}>
        Running the recommendation pipeline
      </p>

      <div className="card p-5 text-left">
        <ul className="space-y-3.5">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className="grid place-items-center w-5 h-5 rounded-full shrink-0 transition-colors"
                  style={{
                    background: done ? "var(--accent)" : active ? "var(--accent-soft)" : "var(--surface-3)",
                    border: active ? "1px solid var(--accent-line)" : "1px solid transparent",
                  }}
                >
                  {done ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : active ? (
                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--accent)" }} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-subtle)" }} />
                  )}
                </span>
                <span
                  className="text-[14px] transition-colors"
                  style={{ color: done || active ? "var(--text)" : "var(--text-subtle)", fontWeight: active ? 500 : 400 }}
                >
                  {label}
                </span>
                {active && (
                  <motion.span layoutId="cursor" className="ml-1 w-1 h-3.5 rounded-full" style={{ background: "var(--accent)" }}
                    animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
