"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
}

export default function MermaidBlock({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#141414",
            primaryColor: "#242424",
            primaryTextColor: "#f0ece4",
            primaryBorderColor: "#3a3a3a",
            lineColor: "#666666",
            secondaryColor: "#1c1c1c",
            tertiaryColor: "#0b0b0b",
            noteTextColor: "#f0ece4",
            noteBkgColor: "#242424",
            noteBorderColor: "#3a3a3a",
            edgeLabelBackground: "#141414",
            clusterBkg: "#1c1c1c",
            clusterBorder: "#3a3a3a",
            titleColor: "#c8ff00",
          },
          fontFamily: '"Space Mono", monospace',
          fontSize: 12,
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <pre
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid var(--wire)",
          padding: "1rem",
          overflow: "auto",
          fontSize: "0.78rem",
          lineHeight: 1.6,
          color: "var(--text-2)",
        }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      style={{
        opacity: rendered ? 1 : 0,
        transition: "opacity 0.2s",
      }}
    />
  );
}
