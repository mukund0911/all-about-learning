"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  tokens?: string[];
  title?: string;
}

const DEFAULT_TOKENS = ["The", "cat", "sat", "on", "the", "mat", "today"];

export default function AttentionHeatmap({ tokens = DEFAULT_TOKENS }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);
  const attentionRef = useRef<number[][]>([]);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  const n = tokens.length;

  // Generate smooth animated attention weights
  function generateAttention(t: number): number[][] {
    const weights: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        // Causal-like pattern with some learned structure
        const causal = j <= i ? 1 : 0.05;
        const diag = Math.exp(-Math.abs(i - j) * 0.8);
        const periodic = Math.sin(t * 0.5 + i * 0.7 + j * 0.3) * 0.15 + 0.15;
        row.push(causal * (diag + periodic));
      }
      // Softmax
      const sum = row.reduce((a, b) => a + b, 0);
      weights.push(row.map((v) => v / sum));
    }
    return weights;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      tRef.current += 0.015;
      const t = tRef.current;
      const attention = generateAttention(t);
      attentionRef.current = attention;

      const W = canvas.width;
      const H = canvas.height;
      const padding = { top: 60, left: 60, right: 20, bottom: 20 };
      const cellW = (W - padding.left - padding.right) / n;
      const cellH = (H - padding.top - padding.bottom) / n;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "rgba(15, 15, 30, 0.0)";
      ctx.fillRect(0, 0, W, H);

      // Draw cells
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const val = attention[row][col];
          const x = padding.left + col * cellW;
          const y = padding.top + row * cellH;

          const isHovered =
            hovered && (hovered.row === row || hovered.col === col);
          const isExact =
            hovered && hovered.row === row && hovered.col === col;

          // Color: indigo → violet based on attention weight
          const r = Math.round(99 + val * (139 - 99));
          const g = Math.round(102 + val * (92 - 102));
          const b = Math.round(241 + val * (246 - 241));
          const alpha = 0.15 + val * 0.85;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

          if (isExact) {
            ctx.strokeStyle = "rgba(6, 182, 212, 0.9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
          } else if (isHovered) {
            ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
          }

          // Value text for large enough cells
          if (cellW > 35 && isExact) {
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = `bold ${Math.min(10, cellW * 0.3)}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val.toFixed(2), x + cellW / 2, y + cellH / 2);
          }
        }
      }

      // Column labels (top)
      ctx.font = `${Math.min(11, cellW * 0.35)}px Inter, sans-serif`;
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.textAlign = "center";
      tokens.forEach((tok, i) => {
        const x = padding.left + i * cellW + cellW / 2;
        const truncated = tok.length > 4 ? tok.slice(0, 4) : tok;
        ctx.fillText(truncated, x, padding.top - 10);
      });

      // Row labels (left)
      ctx.textAlign = "right";
      tokens.forEach((tok, i) => {
        const y = padding.top + i * cellH + cellH / 2;
        const truncated = tok.length > 4 ? tok.slice(0, 4) : tok;
        ctx.fillStyle =
          hovered && hovered.row === i
            ? "rgba(99, 102, 241, 1)"
            : "rgba(148, 163, 184, 0.8)";
        ctx.fillText(truncated, padding.left - 8, y + 4);
      });

      // Axis labels
      ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Keys →", padding.left + (W - padding.left - padding.right) / 2, 14);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [tokens, n, hovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 60, left: 60 };
    const cellW = (canvas.width - padding.left - 20) / n;
    const cellH = (canvas.height - padding.top - 20) / n;

    const col = Math.floor((x - padding.left) / cellW);
    const row = Math.floor((y - padding.top) / cellH);

    if (col >= 0 && col < n && row >= 0 && row < n) {
      setHovered({ row, col });
    } else {
      setHovered(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={380}
        height={320}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        className="cursor-crosshair max-w-full"
        style={{ imageRendering: "pixelated" }}
      />
      {hovered && attentionRef.current[hovered.row] && (
        <div className="mt-2 text-xs text-slate-400 font-mono">
          <span className="text-cyan-400">
            &quot;{tokens[hovered.row]}&quot;
          </span>{" "}
          attends to{" "}
          <span className="text-violet-400">
            &quot;{tokens[hovered.col]}&quot;
          </span>{" "}
          with weight{" "}
          <span className="text-white font-bold">
            {attentionRef.current[hovered.row][hovered.col]?.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
}
