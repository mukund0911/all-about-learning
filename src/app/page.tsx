"use client";

import { motion } from "framer-motion";
import UploadZone from "@/components/upload/UploadZone";
import { GeistPixelCircle } from "geist/font/pixel";

const mono: React.CSSProperties = { fontFamily: '"Space Mono", monospace' };
const display: React.CSSProperties = { fontFamily: '"DM Serif Display", serif' };

const FEATURES = [
  {
    num: "01",
    title: "Concept Extraction",
    tag: "SEMANTIC",
    desc: "Papers reorganized into logical concept flows — including appendices — not read linearly.",
  },
  {
    num: "02",
    title: "Live 3D Visualizations",
    tag: "THREE.JS",
    desc: "Every concept renders an interactive animated visualization — neural nets, attention maps, latent spaces.",
  },
  {
    num: "03",
    title: "Adjustable Depth",
    tag: "1 → 3 LEVELS",
    desc: "From gentle analogies for newcomers to full proofs and formulations for domain experts.",
  },
  {
    num: "04",
    title: "Text Selection",
    tag: "INLINE",
    desc: "Highlight any word or phrase for a contextual explanation at your chosen depth.",
  },
  {
    num: "05",
    title: "Local Library",
    tag: "INDEXED",
    desc: "All papers stored locally in your browser via IndexedDB. No account, no cloud.",
  },
];

const DEPTH_LEVELS = [
  { num: "1", label: "INTUITIVE",  desc: "Everyday analogies, no jargon" },
  { num: "2", label: "BALANCED",   desc: "Key ideas with light notation" },
  { num: "3", label: "TECHNICAL",  desc: "Full formulations & proofs" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--ink)", color: "var(--text)" }}>

      {/* ─────────────────────────────────────────────────
          01 / HERO
      ───────────────────────────────────────────────── */}
      <section
        className="min-h-screen flex flex-col justify-center"
        style={{ borderBottom: "1px solid var(--wire)" }}
      >
        <div className="max-w-screen-xl mx-auto w-full px-8 lg:px-16 py-24">

          {/* Section index */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              ...mono,
              fontSize: "10px",
              letterSpacing: "0.32em",
              color: "var(--mist)",
              marginBottom: "3rem",
            }}
          >
            01 ——— RESEARCH PAPER INTELLIGENCE
          </motion.p>

          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">

            {/* Left — headline */}
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={GeistPixelCircle.className}
                style={{
                  fontSize: "clamp(3.2rem, 8.5vw, 8.5rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: "var(--text)",
                }}
              >
                <span style={{ color: "var(--flash)" }}>Visualize</span><br />
                any research paper.
              </motion.h1>
            </div>

            {/* Right — upload zone */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="w-full lg:w-[480px] flex-shrink-0 mt-10 lg:mt-0"
            >
              <UploadZone />
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-end gap-0 mt-16"
            style={{ borderTop: "1px solid var(--wire)" }}
          >
            {[
              { val: "3",  unit: "DEPTH LEVELS" },
              { val: "8+", unit: "VIZ TYPES" },
              { val: "∞",  unit: "PAPERS, LOCALLY" },
            ].map((s, i) => (
              <div
                key={s.unit}
                className="flex-1"
                style={{
                  padding: "1.5rem 0",
                  borderLeft: i > 0 ? "1px solid var(--wire)" : "none",
                  paddingLeft: i > 0 ? "2rem" : "0",
                }}
              >
                <div style={{ ...display, fontStyle: "italic", fontSize: "2.75rem", lineHeight: 1, color: "var(--text)", marginBottom: "0.3rem" }}>
                  {s.val}
                </div>
                <div style={{ ...mono, fontSize: "9px", letterSpacing: "0.28em", color: "var(--mist)" }}>
                  {s.unit}
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          02 / CAPABILITIES
      ───────────────────────────────────────────────── */}
      <section
        className="py-24"
        style={{ borderBottom: "1px solid var(--wire)" }}
      >
        <div className="max-w-screen-xl mx-auto px-8 lg:px-16">

          <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.32em", color: "var(--mist)", marginBottom: "3.5rem" }}>
            02 ——— CAPABILITIES
          </p>

          <div>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group"
                style={{ borderTop: "1px solid var(--wire)" }}
              >
                <div
                  className="py-6 grid gap-x-8 gap-y-2"
                  style={{ gridTemplateColumns: "2.25rem 1fr auto" }}
                >
                  {/* Index */}
                  <span style={{ ...mono, fontSize: "10px", letterSpacing: "0.2em", color: "var(--ghost)", alignSelf: "baseline" }}>
                    {f.num}
                  </span>

                  {/* Title */}
                  <h3 style={{ ...display, fontStyle: "italic", fontSize: "clamp(1.15rem, 2.2vw, 1.65rem)", color: "var(--text)", lineHeight: 1, alignSelf: "baseline" }}>
                    {f.title}
                  </h3>

                  {/* Tag — highlights on hover */}
                  <span
                    className="group-hover:opacity-100 transition-all"
                    style={{ ...mono, fontSize: "9px", letterSpacing: "0.28em", color: "var(--mist)", alignSelf: "baseline" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--flash)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mist)")}
                  >
                    {f.tag}
                  </span>

                  {/* Desc — spans under title + tag */}
                  <p
                    style={{
                      gridColumn: "2 / -1",
                      fontSize: "13px",
                      lineHeight: 1.65,
                      color: "var(--text-2)",
                      marginTop: "0.35rem",
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            <div style={{ height: "1px", background: "var(--wire)" }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          03 / DEPTH
      ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-screen-xl mx-auto px-8 lg:px-16">

          <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.32em", color: "var(--mist)", marginBottom: "4rem" }}>
            03 ——— READING DEPTH
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3">
            {DEPTH_LEVELS.map((d, i) => (
              <motion.div
                key={d.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 sm:p-8"
                style={{
                  borderTop: "1px solid var(--wire)",
                  borderLeft: i > 0 ? "1px solid var(--wire)" : "none",
                }}
              >
                <div
                  style={{
                    ...display,
                    fontStyle: "italic",
                    fontSize: "3.75rem",
                    lineHeight: 1,
                    color: i === 1 ? "var(--flash)" : "var(--text)",
                    marginBottom: "0.85rem",
                  }}
                >
                  {d.num}
                </div>
                <div style={{ ...mono, fontSize: "9px", letterSpacing: "0.28em", color: "var(--mist)", marginBottom: "0.5rem" }}>
                  {d.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.5 }}>
                  {d.desc}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
