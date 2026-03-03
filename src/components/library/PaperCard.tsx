"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen, Tag, Trash2, ExternalLink } from "lucide-react";
import type { Paper } from "@/lib/types";

interface Props {
  paper: Paper;
  onDelete: (id: string) => void;
}

export default function PaperCard({ paper, onDelete }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(15,15,30,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${paper.thumbnailColor}`} />

      {/* Color block with initials */}
      <div className={`h-28 bg-gradient-to-br ${paper.thumbnailColor} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="text-3xl font-bold text-white/40 select-none uppercase">
          {paper.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {paper.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 ? ` +${paper.authors.length - 3} more` : ""}
          </p>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {paper.abstract.slice(0, 140)}...
        </p>

        {/* Tags */}
        {paper.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {paper.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-slate-600 mt-auto">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {paper.readingTimeMinutes}m read
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {paper.conceptCount} concepts
          </span>
          {paper.year && <span>{paper.year}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/paper/${paper.id}`}
            className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors"
          >
            Open Paper
          </Link>
          {paper.sourceUrl && (
            <a
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => onDelete(paper.id)}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
