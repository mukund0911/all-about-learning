"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, FileText, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { savePaper } from "@/lib/storage";
import type { StoredPaper } from "@/lib/types";

type Mode = "idle" | "uploading" | "analyzing" | "error";

export default function UploadZone() {
  const [mode, setMode] = useState<Mode>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [tab, setTab] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        setMode("error");
        return;
      }

      setMode("uploading");
      setProgress("Parsing PDF...");
      setError("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress("Analyzing paper with AI...");
        setMode("analyzing");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        const stored: StoredPaper = data.paper;
        await savePaper(stored);
        router.push(`/paper/${stored.meta.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setMode("error");
      }
    },
    [router]
  );

  const processUrl = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      setMode("error");
      return;
    }

    setMode("uploading");
    setProgress("Fetching paper...");
    setError("");

    try {
      const formData = new FormData();
      formData.append("url", url.trim());

      setProgress("Analyzing paper with AI...");
      setMode("analyzing");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to process URL");

      const stored: StoredPaper = data.paper;
      await savePaper(stored);
      router.push(`/paper/${stored.meta.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMode("error");
    }
  }, [url, router]);

  const isLoading = mode === "uploading" || mode === "analyzing";

  const mono = { fontFamily: '"Space Mono", monospace' } as const;

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: "1px solid var(--wire)" }}>
        {(["file", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-4 py-2.5 transition-all"
            style={{
              ...mono,
              fontSize: "9px",
              letterSpacing: "0.25em",
              color: tab === t ? "var(--text)" : "var(--mist)",
              borderBottom: tab === t ? "1px solid var(--flash)" : "1px solid transparent",
              marginBottom: "-1px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {t === "file" ? <Upload style={{ width: "11px", height: "11px" }} /> : <Link2 style={{ width: "11px", height: "11px" }} />}
            {t === "file" ? "PDF FILE" : "PASTE URL"}
          </button>
        ))}
      </div>

      {/* Upload area */}
      <AnimatePresence mode="wait">
        {tab === "file" ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files[0];
                if (file) processFile(file);
              }}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`relative p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${isLoading ? "pointer-events-none" : ""}`}
              style={{
                border: dragActive
                  ? "1px dashed var(--flash)"
                  : "1px dashed var(--wire)",
                background: dragActive ? "var(--flash-dim)" : "transparent",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                }}
              />

              {isLoading ? (
                <>
                  <div className="relative">
                    <div className="w-14 h-14 flex items-center justify-center" style={{ border: "1px solid var(--wire)" }}>
                      <Loader2 style={{ width: "22px", height: "22px", color: "var(--flash)" }} className="animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: "10px", letterSpacing: "0.2em", color: "var(--text)", marginBottom: "0.4rem" }}>
                      {mode === "uploading" ? "PROCESSING PDF" : "ANALYZING WITH AI"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-2)" }}>{progress}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center" style={{ width: "3.5rem", height: "3.5rem", border: "1px solid var(--wire)" }}>
                    <FileText style={{ width: "20px", height: "20px", color: "var(--mist)" }} />
                  </div>
                  <div className="text-center">
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: "10px", letterSpacing: "0.2em", color: "var(--text)", marginBottom: "0.5rem" }}>
                      DROP PAPER HERE
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-2)" }}>
                      or click to browse — PDF only
                    </div>
                  </div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: "9px", letterSpacing: "0.15em", color: "var(--ghost)" }}>
                    arXiv · journals · conference proceedings
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <Link2 style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--ghost)" }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && processUrl()}
                  placeholder="https://arxiv.org/abs/2301.00000"
                  disabled={isLoading}
                  className="w-full outline-none transition-all"
                  style={{
                    paddingLeft: "2.75rem",
                    paddingRight: "1rem",
                    paddingTop: "0.875rem",
                    paddingBottom: "0.875rem",
                    fontSize: "13px",
                    color: "var(--text)",
                    background: "var(--ink-2)",
                    border: "1px solid var(--wire)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button
                onClick={processUrl}
                disabled={isLoading || !url.trim()}
                className="flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  padding: "0.875rem 1.25rem",
                  background: "var(--flash)",
                  color: "var(--ink)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {isLoading ? (
                  <Loader2 style={{ width: "13px", height: "13px" }} className="animate-spin" />
                ) : (
                  <ArrowRight style={{ width: "13px", height: "13px" }} />
                )}
                {isLoading ? "..." : "ANALYZE"}
              </button>
            </div>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontFamily: '"Space Mono", monospace', fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-2)" }}
              >
                <Loader2 style={{ width: "11px", height: "11px", display: "inline", marginRight: "0.5rem" }} className="animate-spin" />
                {progress}
              </motion.div>
            )}

            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: "9px", letterSpacing: "0.15em", color: "var(--ghost)" }}>
              SUPPORTS ARXIV + DIRECT PDF LINKS
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {mode === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 p-4"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
          >
            <AlertCircle style={{ width: "14px", height: "14px", color: "#f87171", flexShrink: 0 }} />
            <div style={{ fontSize: "12px", color: "#fca5a5" }}>{error}</div>
            <button
              onClick={() => setMode("idle")}
              style={{ marginLeft: "auto", fontFamily: '"Space Mono", monospace', fontSize: "9px", letterSpacing: "0.2em", color: "#f87171", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              RETRY
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
