"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Database, Wand2, FileText, Boxes, ListOrdered, Sparkles } from "lucide-react";

const STAGES = [
  { icon: Database, title: "Dataset", desc: "11,314 anime titles with genres, synopses, ratings and popularity." },
  { icon: Wand2, title: "Feature Engineering", desc: "Cleaning, normalizing and combining text + metadata into signals." },
  { icon: FileText, title: "TF-IDF Extraction", desc: "Synopses become weighted vectors capturing what each title is about." },
  { icon: Boxes, title: "K-Means Clustering", desc: "Titles group into content clusters that share themes and tone." },
  { icon: ListOrdered, title: "Similarity Ranking", desc: "Your preferences are scored against every title by cosine similarity." },
  { icon: Sparkles, title: "Recommendations", desc: "The best-matching, highest-confidence titles surface for you." },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-20">
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 text-left">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>Transparency</p>
            <h2 className="font-display font-600 text-lg" style={{ fontWeight: 600, color: "var(--text)" }}>How AniMatch Works</h2>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-subtle)" }}>The model is open — see exactly how your recommendations are made.</p>
          </div>
          <span className="grid place-items-center w-9 h-9 rounded-lg shrink-0" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
              <div className="px-5 pb-6 pt-1 grid gap-3 md:grid-cols-3">
                {STAGES.map((s, i) => (
                  <motion.div key={s.title}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="rounded-xl p-4" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="grid place-items-center w-7 h-7 rounded-lg" style={{ background: "var(--accent-soft)" }}>
                        <s.icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      </span>
                      <span className="text-[11px] tnum font-medium" style={{ color: "var(--text-subtle)" }}>Step {i + 1}</span>
                    </div>
                    <p className="font-display font-600 text-[14px] mb-1" style={{ fontWeight: 600, color: "var(--text)" }}>{s.title}</p>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
