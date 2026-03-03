"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Library, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { getPaperMetas, deletePaper } from "@/lib/storage";
import PaperCard from "@/components/library/PaperCard";
import type { Paper } from "@/lib/types";

export default function LibraryPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPapers(getPaperMetas());
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this paper from your library?")) return;
    await deletePaper(id);
    setPapers(getPaperMetas());
  };

  const filtered = papers.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.authors.some((a) => a.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.abstract.toLowerCase().includes(q)
    );
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Library className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Library</h1>
              <p className="text-sm text-slate-500">
                {papers.length} paper{papers.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Paper
          </Link>
        </div>

        {/* Search */}
        {papers.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, or topic…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Empty state */}
      {papers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-6">
            <BookOpen className="w-9 h-9 text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">
            Your library is empty
          </h2>
          <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">
            Upload a research paper or paste an arXiv link to start building your
            visual knowledge base.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first paper
          </Link>
        </motion.div>
      )}

      {/* No results */}
      {papers.length > 0 && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-slate-500"
        >
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No papers match &quot;{search}&quot;</p>
        </motion.div>
      )}

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filtered.map((paper, i) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PaperCard paper={paper} onDelete={handleDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
