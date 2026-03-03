"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Map,
  BookOpen,
  Clock,
  Users,
  ChevronRight,
  Target,
  AlertTriangle,
  Network,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { loadPaper } from "@/lib/storage";
import type { StoredPaper } from "@/lib/types";
import ConceptSection from "@/components/paper/ConceptSection";
import TextSelectionPanel from "@/components/paper/TextSelectionPanel";

const ConceptGraphViz = dynamic(
  () => import("@/components/visualizations/ConceptGraphViz"),
  { ssr: false }
);

const mono: React.CSSProperties = { fontFamily: '"Space Mono", monospace' };
const display: React.CSSProperties = { fontFamily: '"DM Serif Display", serif' };

type SidePanel = "nav" | "graph" | "overview";

export default function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [stored, setStored] = useState<StoredPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>("nav");
  const [graphNode, setGraphNode] = useState<string | undefined>(undefined);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadPaper(id).then((s) => {
      setStored(s);
      setLoading(false);
      if (s?.analysis.conceptSections[0]) {
        setActiveSection(s.analysis.conceptSections[0].id);
      }
    });
  }, [id]);

  // IntersectionObserver for scroll-based active section highlighting
  useEffect(() => {
    if (!stored) return;
    const sections = stored.analysis.conceptSections;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [stored]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--ink)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0"
              style={{ border: "1px solid var(--wire)", borderRadius: 0 }}
            />
            <div
              className="absolute inset-0 animate-spin"
              style={{
                borderTop: "2px solid var(--flash)",
                borderRadius: 0,
              }}
            />
          </div>
          <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.28em", color: "var(--mist)" }}>
            LOADING PAPER
          </p>
        </motion.div>
      </div>
    );
  }

  if (!stored) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--ink)" }}
      >
        <p style={{ ...mono, fontSize: "11px", color: "var(--mist)" }}>
          Paper not found in your library.
        </p>
        <Link
          href="/library"
          style={{ ...mono, fontSize: "10px", color: "var(--flash)", letterSpacing: "0.2em", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO LIBRARY
        </Link>
      </div>
    );
  }

  const { meta, analysis } = stored;
  const activeSectionData = analysis.conceptSections.find(
    (s) => s.id === activeSection
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ink)" }}>

      {/* Top bar */}
      <div
        className="sticky top-14 z-30 flex items-center gap-4 px-6"
        style={{
          height: 52,
          background: "rgba(11,11,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--wire)",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ color: "var(--mist)", padding: "6px", background: "none", border: "none", cursor: "pointer", display: "flex" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mist)")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <h2
            style={{
              ...display,
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {meta.title}
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <span
            style={{ ...mono, fontSize: "9px", letterSpacing: "0.2em", color: "var(--ghost)", display: "flex", alignItems: "center", gap: "0.3rem" }}
          >
            <Clock className="w-3 h-3" />
            {meta.readingTimeMinutes}M
          </span>
          <span
            style={{ ...mono, fontSize: "9px", letterSpacing: "0.2em", color: "var(--ghost)", display: "flex", alignItems: "center", gap: "0.3rem" }}
          >
            <BookOpen className="w-3 h-3" />
            {meta.conceptCount} CONCEPTS
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 108px)" }}>

        {/* Left sidebar */}
        <aside
          className="shrink-0 flex flex-col overflow-hidden"
          style={{
            width: 240,
            background: "rgba(255,255,255,0.015)",
            borderRight: "1px solid var(--wire)",
          }}
        >
          {/* Sidebar tabs */}
          <div className="flex" style={{ borderBottom: "1px solid var(--wire)" }}>
            {(
              [
                { id: "nav",      icon: <BookOpen className="w-3.5 h-3.5" />, label: "CONCEPTS" },
                { id: "graph",    icon: <Network className="w-3.5 h-3.5" />,  label: "GRAPH" },
                { id: "overview", icon: <Map className="w-3.5 h-3.5" />,      label: "OVERVIEW" },
              ] as { id: SidePanel; icon: React.ReactNode; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setSidePanel(t.id)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3"
                style={{
                  ...mono,
                  fontSize: "8px",
                  letterSpacing: "0.18em",
                  color: sidePanel === t.id ? "var(--flash)" : "var(--ghost)",
                  background: "none",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: sidePanel === t.id ? "1px solid var(--flash)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* Concept nav */}
            {sidePanel === "nav" && (
              <div className="py-3">
                <div
                  style={{
                    ...mono,
                    fontSize: "8px",
                    letterSpacing: "0.28em",
                    color: "var(--ghost)",
                    padding: "0.5rem 1rem 0.75rem",
                  }}
                >
                  READING ORDER
                </div>
                {analysis.conceptSections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-start gap-2.5 text-left"
                      style={{
                        padding: "0.6rem 1rem",
                        background: isActive ? "rgba(200,255,0,0.06)" : "none",
                        borderLeft: isActive ? "2px solid var(--flash)" : "2px solid transparent",
                        borderTop: "none",
                        borderRight: "none",
                        borderBottom: "none",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      <span
                        style={{
                          ...mono,
                          fontSize: "9px",
                          color: isActive ? "var(--flash)" : "var(--ghost)",
                          minWidth: "1.5rem",
                          paddingTop: "0.1rem",
                        }}
                      >
                        {String(section.order).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          lineHeight: 1.4,
                          color: isActive ? "var(--text)" : "var(--mist)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {section.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="shrink-0 w-3 h-3 ml-auto" style={{ color: "var(--flash)", marginTop: "0.15rem" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Concept graph */}
            {sidePanel === "graph" && (
              <div className="h-full p-2">
                <ConceptGraphViz
                  nodes={analysis.conceptGraph.nodes}
                  edges={analysis.conceptGraph.edges}
                  activeNode={graphNode ?? activeSection ?? undefined}
                  onNodeClick={(id) => {
                    setGraphNode(id);
                    scrollToSection(id);
                    setSidePanel("nav");
                  }}
                />
              </div>
            )}

            {/* Overview */}
            {sidePanel === "overview" && (
              <div className="p-4 space-y-6">

                <div>
                  <div style={{ ...mono, fontSize: "8px", letterSpacing: "0.28em", color: "var(--ghost)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Users className="w-3 h-3" /> AUTHORS
                  </div>
                  <div className="space-y-1">
                    {meta.authors.map((a, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "var(--mist)" }}>{a}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ ...mono, fontSize: "8px", letterSpacing: "0.28em", color: "var(--ghost)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Target className="w-3 h-3" /> KEY CONTRIBUTIONS
                  </div>
                  <ul className="space-y-2">
                    {analysis.keyContributions.map((c, i) => (
                      <li key={i} style={{ fontSize: "11px", color: "var(--mist)", lineHeight: 1.5, display: "flex", gap: "0.5rem" }}>
                        <span style={{ color: "var(--flash)", flexShrink: 0 }}>&#9670;</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.limitations.length > 0 && (
                  <div>
                    <div style={{ ...mono, fontSize: "8px", letterSpacing: "0.28em", color: "var(--ghost)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <AlertTriangle className="w-3 h-3" /> LIMITATIONS
                    </div>
                    <ul className="space-y-2">
                      {analysis.limitations.map((l, i) => (
                        <li key={i} style={{ fontSize: "11px", color: "var(--mist)", lineHeight: 1.5, display: "flex", gap: "0.5rem" }}>
                          <span style={{ color: "rgba(255,180,0,0.7)", flexShrink: 0 }}>&#9670;</span>
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div style={{ ...mono, fontSize: "8px", letterSpacing: "0.28em", color: "var(--ghost)", marginBottom: "0.6rem" }}>
                    RECOMMENDED PATH
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--mist)", lineHeight: 1.6 }}>
                    {analysis.recommendedPath}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        ...mono,
                        fontSize: "8px",
                        letterSpacing: "0.16em",
                        padding: "3px 7px",
                        background: "rgba(200,255,0,0.07)",
                        color: "var(--flash)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="px-8 lg:px-12 py-10">

            {/* Paper header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-8"
              style={{ borderBottom: "1px solid var(--wire)", marginBottom: "0" }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {meta.venue && (
                  <span style={{ ...mono, fontSize: "9px", letterSpacing: "0.2em", color: "var(--flash)", padding: "3px 8px", background: "rgba(200,255,0,0.08)" }}>
                    {meta.venue}
                  </span>
                )}
                {meta.year && (
                  <span style={{ ...mono, fontSize: "9px", letterSpacing: "0.15em", color: "var(--ghost)" }}>
                    {meta.year}
                  </span>
                )}
              </div>

              <h1
                style={{
                  ...display,
                  fontStyle: "italic",
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  lineHeight: 1.1,
                  color: "var(--text)",
                  marginBottom: "0.75rem",
                }}
              >
                {meta.title}
              </h1>

              <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.08em", color: "var(--mist)", marginBottom: "1.25rem" }}>
                {meta.authors.slice(0, 4).join(" · ")}
                {meta.authors.length > 4 ? ` · +${meta.authors.length - 4} more` : ""}
              </p>

              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "var(--text-2)",
                  maxWidth: "72ch",
                  textAlign: "justify",
                }}
                data-paper-text
              >
                {meta.abstract}
              </p>
            </motion.div>

            {/* Concept sections — all visible, no accordion */}
            <div>
              {analysis.conceptSections.map((section) => (
                <ConceptSection
                  key={section.id}
                  section={section}
                />
              ))}
              <div style={{ height: "1px", background: "var(--wire)" }} />
            </div>

            <div className="h-16" />
          </div>
        </main>
      </div>

      {/* Text selection panel */}
      <TextSelectionPanel
        paperTitle={meta.title}
        sectionTitle={activeSectionData?.title || ""}
      />
    </div>
  );
}
