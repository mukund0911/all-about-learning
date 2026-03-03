"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import type { ConceptSection as ConceptSectionType } from "@/lib/types";
import MermaidBlock from "./MermaidBlock";

const mono: React.CSSProperties = { fontFamily: '"Space Mono", monospace' };

const DEPTH_BADGES: Record<string, { bg: string; text: string }> = {
  foundational: { bg: "rgba(200,255,0,0.08)", text: "var(--flash)" },
  core:         { bg: "rgba(200,255,0,0.14)", text: "var(--flash)" },
  advanced:     { bg: "rgba(255,255,255,0.06)", text: "var(--mist)" },
  supplementary:{ bg: "rgba(255,255,255,0.04)", text: "var(--ghost)" },
};

interface Props {
  section: ConceptSectionType;
}

export default function ConceptSection({ section }: Props) {
  const badge = DEPTH_BADGES[section.depth] ?? DEPTH_BADGES.supplementary;
  const content = section.content ?? "";

  return (
    <div
      id={section.id}
      style={{ borderTop: "1px solid var(--wire)" }}
    >
      {/* Section header */}
      <div className="flex items-start gap-5 py-5">
        {/* Order number */}
        <span
          style={{
            ...mono,
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "var(--flash)",
            paddingTop: "0.15rem",
            minWidth: "2rem",
          }}
        >
          {String(section.order).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h3
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: "italic",
                fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
                color: "var(--text)",
                lineHeight: 1.1,
              }}
            >
              {section.title}
            </h3>
            <span
              style={{
                ...mono,
                fontSize: "8px",
                letterSpacing: "0.22em",
                padding: "2px 6px",
                background: badge.bg,
                color: badge.text,
                textTransform: "uppercase",
              }}
            >
              {section.depth}
            </span>
          </div>
          <p style={{ ...mono, fontSize: "10px", color: "var(--ghost)", letterSpacing: "0.05em" }}>
            {section.sourceSection}
          </p>
        </div>
      </div>

      {/* Body — always visible */}
      <div className="pb-8 space-y-6" style={{ paddingLeft: "3rem" }}>

        {/* Key insight */}
        <div
          style={{
            borderLeft: "2px solid var(--flash)",
            paddingLeft: "1rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.6 }}>
            {section.keyInsight}
          </p>
        </div>

        {/* Rich markdown content */}
        <div
          className="concept-content prose prose-invert prose-sm max-w-none"
          data-paper-text
          style={{
            fontSize: "13px",
            lineHeight: 1.7,
            color: "var(--text-2)",
          }}
        >
          <style>{`
            .concept-content h2 {
              color: var(--text);
              font-size: 1rem;
              font-family: "DM Serif Display", serif;
              font-style: italic;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              border-bottom: 1px solid var(--wire);
              padding-bottom: 0.4rem;
            }
            .concept-content h3 {
              color: var(--text);
              font-size: 0.85rem;
              font-family: "Space Mono", monospace;
              letter-spacing: 0.08em;
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
            }
            .concept-content h4 {
              color: var(--text);
              font-size: 0.8rem;
              font-family: "Space Mono", monospace;
              letter-spacing: 0.05em;
              margin-top: 1rem;
              margin-bottom: 0.4rem;
            }
            .concept-content p {
              color: var(--text-2);
              font-size: 0.82rem;
              line-height: 1.8;
              margin-bottom: 0.75rem;
            }
            .concept-content strong {
              color: var(--text);
            }
            .concept-content code {
              color: var(--flash);
              font-size: 0.75rem;
              background: rgba(200,255,0,0.07);
              padding: 1px 5px;
              border-radius: 0;
            }
            .concept-content pre {
              background: rgba(255,255,255,0.025);
              border: 1px solid var(--wire);
              padding: 1rem;
              overflow-x: auto;
              font-size: 0.78rem;
              line-height: 1.6;
              margin: 1rem 0;
            }
            .concept-content pre code {
              background: none;
              padding: 0;
              color: var(--text-2);
              font-size: 0.78rem;
            }
            .concept-content ul, .concept-content ol {
              color: var(--text-2);
              font-size: 0.82rem;
              line-height: 1.75;
              padding-left: 1.25rem;
            }
            .concept-content li {
              margin-bottom: 0.3rem;
            }
            .concept-content blockquote {
              border-left: 2px solid var(--flash);
              color: var(--text-2);
              padding: 0.5rem 0.75rem;
              margin: 1rem 0;
              background: rgba(200,255,0,0.03);
            }
            .concept-content blockquote strong {
              color: var(--flash);
            }
            .concept-content table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.78rem;
              margin: 1rem 0;
            }
            .concept-content th {
              background: rgba(255,255,255,0.04);
              color: var(--text);
              font-family: "Space Mono", monospace;
              font-size: 0.72rem;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              text-align: left;
              padding: 0.5rem 0.75rem;
              border: 1px solid var(--wire);
            }
            .concept-content td {
              padding: 0.4rem 0.75rem;
              border: 1px solid var(--wire);
              color: var(--text-2);
            }
            .concept-content tr:nth-child(even) td {
              background: rgba(255,255,255,0.015);
            }
            .concept-content .katex-display {
              margin: 1rem 0;
              overflow-x: auto;
              padding: 0.5rem 0;
            }
            .concept-content .katex {
              font-size: 0.95em;
            }
          `}</style>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-mermaid/.exec(className || "");
                if (match) {
                  return <MermaidBlock code={String(children).trim()} />;
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                // Check if the child is a mermaid code block — if so, skip the <pre> wrapper
                const child = children as React.ReactElement<{ className?: string }>;
                if (
                  child &&
                  typeof child === "object" &&
                  "props" in child &&
                  /language-mermaid/.test(child.props?.className || "")
                ) {
                  return <>{children}</>;
                }
                return <pre>{children}</pre>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Source */}
        <div style={{ ...mono, fontSize: "9px", color: "var(--ghost)", letterSpacing: "0.1em" }}>
          SOURCE: {section.sourceSection}
        </div>
      </div>
    </div>
  );
}
