"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mono: React.CSSProperties = { fontFamily: '"Space Mono", monospace' };

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 lg:px-12"
      style={{ background: "var(--ink)", borderBottom: "1px solid var(--wire)" }}
    >
      <Link
        href="/"
        style={{
          ...mono,
          fontSize: "11px",
          letterSpacing: "0.22em",
          color: "var(--text)",
          textDecoration: "none",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--flash)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
      >
        LENS—PAPER
      </Link>

      <nav className="flex items-center gap-8">
        <Link
          href="/library"
          style={{
            ...mono,
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: pathname === "/library" ? "var(--flash)" : "var(--mist)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (pathname !== "/library")
              e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            if (pathname !== "/library")
              e.currentTarget.style.color = "var(--mist)";
          }}
        >
          LIBRARY
        </Link>

        <span
          className="hidden sm:block"
          style={{
            ...mono,
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "var(--ghost)",
          }}
        >
          × CLAUDE
        </span>
      </nav>
    </header>
  );
}
