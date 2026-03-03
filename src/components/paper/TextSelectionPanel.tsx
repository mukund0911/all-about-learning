"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const mono: React.CSSProperties = { fontFamily: '"Space Mono", monospace' };

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

interface Props {
  paperTitle: string;
  sectionTitle: string;
}

export default function TextSelectionPanel({ paperTitle, sectionTitle }: Props) {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (text.length < 3) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 44,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-selection-panel]")) {
        if (!(e.target as HTMLElement).closest("[data-paper-text]")) {
          setSelection(null);
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const explain = useCallback(async () => {
    if (!selection) return;
    setPanelOpen(true);
    setStreaming(true);
    setExplanation("");
    const selectedText = selection.text;
    setSelection(null);

    try {
      const sel = window.getSelection();
      const surrounding = sel?.anchorNode?.textContent?.slice(0, 500) || "";

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          surroundingContext: surrounding,
          paperTitle,
          sectionTitle,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setExplanation(err.error || "Failed to get explanation.");
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setExplanation("Failed to get explanation stream.");
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setExplanation(accumulated);
      }
    } catch {
      setExplanation("Failed to get explanation. Please try again.");
    } finally {
      setStreaming(false);
    }
  }, [selection, paperTitle, sectionTitle]);

  return (
    <>
      {/* Floating tooltip on text selection */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.13 }}
            className="fixed z-50"
            style={{
              left: selection.x,
              top: selection.y,
              transform: "translateX(-50%)",
            }}
            data-selection-panel
          >
            <button
              onClick={explain}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "6px 14px",
                background: "var(--ink)",
                border: "1px solid var(--flash)",
                color: "var(--flash)",
                cursor: "pointer",
                ...mono,
                fontSize: "9px",
                letterSpacing: "0.22em",
              }}
            >
              <Sparkles className="w-3 h-3" />
              EXPLAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation side panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 top-20 bottom-4 z-40 flex flex-col overflow-hidden"
            style={{
              width: 380,
              background: "rgba(11,11,11,0.97)",
              border: "1px solid var(--wire)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: "1px solid var(--wire)" }}
            >
              <div className="flex-1 min-w-0">
                <div style={{ ...mono, fontSize: "9px", letterSpacing: "0.28em", color: "var(--flash)" }}>
                  CONCEPT EXPLAINED
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--mist)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}
                >
                  {sectionTitle}
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                style={{
                  color: "var(--ghost)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ghost)")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {streaming && explanation === "" ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div
                    className="w-5 h-5 animate-spin"
                    style={{ border: "2px solid var(--wire)", borderTop: "2px solid var(--flash)" }}
                  />
                  <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.22em", color: "var(--mist)" }}>
                    GENERATING
                  </p>
                </div>
              ) : (
                <div
                  className="explain-content prose prose-invert prose-sm max-w-none"
                  style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--text-2)" }}
                >
                  <style>{`
                    .explain-content h1, .explain-content h2, .explain-content h3, .explain-content h4 {
                      color: var(--text);
                      font-size: 0.82rem;
                      font-family: "Space Mono", monospace;
                      letter-spacing: 0.18em;
                      text-transform: uppercase;
                      margin-top: 1.25rem;
                      margin-bottom: 0.5rem;
                    }
                    .explain-content p { color: var(--text-2); font-size: 0.8rem; line-height: 1.75; }
                    .explain-content strong { color: var(--text); }
                    .explain-content code {
                      color: var(--flash);
                      font-size: 0.75rem;
                      background: rgba(200,255,0,0.07);
                      padding: 1px 5px;
                      border-radius: 0;
                    }
                    .explain-content ul, .explain-content ol { color: var(--text-2); font-size: 0.8rem; }
                    .explain-content blockquote {
                      border-left: 2px solid var(--flash);
                      color: var(--mist);
                      padding-left: 0.75rem;
                    }
                    .explain-content .katex-display {
                      margin: 0.75rem 0;
                      overflow-x: auto;
                    }
                  `}</style>
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {explanation}
                  </ReactMarkdown>
                  {streaming && (
                    <span
                      className="inline-block w-2 h-4 animate-pulse"
                      style={{ background: "var(--flash)", verticalAlign: "text-bottom", marginLeft: "2px" }}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
