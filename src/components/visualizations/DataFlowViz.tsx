"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  type: "input" | "process" | "output" | "decision";
  color?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface Props {
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}

const DEFAULT_NODES: FlowNode[] = [
  { id: "input", label: "Input", sublabel: "Raw Data", type: "input" },
  { id: "encode", label: "Encoder", sublabel: "Feature Extraction", type: "process" },
  { id: "latent", label: "Latent Space", sublabel: "z ~ N(0, I)", type: "decision" },
  { id: "decode", label: "Decoder", sublabel: "Reconstruction", type: "process" },
  { id: "output", label: "Output", sublabel: "Prediction", type: "output" },
];

const DEFAULT_EDGES: FlowEdge[] = [
  { from: "input", to: "encode", label: "x" },
  { from: "encode", to: "latent", label: "f(x)" },
  { from: "latent", to: "decode", label: "z" },
  { from: "decode", to: "output", label: "x̂" },
];

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  input: { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.5)", text: "#06b6d4" },
  process: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.5)", text: "#6366f1" },
  output: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.5)", text: "#10b981" },
  decision: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.5)", text: "#8b5cf6" },
};

export default function DataFlowViz({ nodes = DEFAULT_NODES, edges = DEFAULT_EDGES }: Props) {
  const [activeEdge, setActiveEdge] = useState(0);
  const [pulsePos, setPulsePos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePos((p) => {
        if (p >= 1) {
          setActiveEdge((e) => (e + 1) % edges.length);
          return 0;
        }
        return p + 0.04;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [edges.length]);

  // Simple horizontal layout
  const nodeCount = nodes.length;
  const nodeWidth = 110;
  const nodeHeight = 64;
  const gap = 48;
  const totalW = nodeCount * nodeWidth + (nodeCount - 1) * gap;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative overflow-x-auto max-w-full">
        <svg
          width={totalW + 20}
          height={nodeHeight + 80}
          style={{ overflow: "visible" }}
        >
          {/* Draw edges */}
          {edges.map((edge, i) => {
            const fromIdx = nodes.findIndex((n) => n.id === edge.from);
            const toIdx = nodes.findIndex((n) => n.id === edge.to);
            if (fromIdx < 0 || toIdx < 0) return null;

            const x1 = fromIdx * (nodeWidth + gap) + nodeWidth + 10;
            const x2 = toIdx * (nodeWidth + gap) + 10;
            const y = nodeHeight / 2 + 20;

            const isActive = i === activeEdge;
            const pulseX = x1 + (x2 - x1) * pulsePos;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={isActive ? "rgba(99,102,241,0.6)" : "rgba(71,85,105,0.4)"}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeDasharray={isActive ? "none" : "4 4"}
                />
                {/* Arrow */}
                <polygon
                  points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`}
                  fill={isActive ? "rgba(99,102,241,0.6)" : "rgba(71,85,105,0.4)"}
                />
                {/* Edge label */}
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgba(148,163,184,0.7)"
                    fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                )}
                {/* Pulse dot */}
                {isActive && (
                  <circle
                    cx={pulseX}
                    cy={y}
                    r={4}
                    fill="#6366f1"
                    opacity={0.9}
                  />
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node, i) => {
            const x = i * (nodeWidth + gap) + 10;
            const y = 20;
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.process;

            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={8}
                  fill={style.bg}
                  stroke={style.border}
                  strokeWidth={1.5}
                />
                <text
                  x={x + nodeWidth / 2}
                  y={y + nodeHeight / 2 - 6}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={style.text}
                  fontFamily="Inter, sans-serif"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={x + nodeWidth / 2}
                    y={y + nodeHeight / 2 + 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="rgba(148,163,184,0.7)"
                    fontFamily="monospace"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active edge info */}
      <motion.div
        key={activeEdge}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-xs text-slate-500"
      >
        {edges[activeEdge] && (
          <span>
            <span className="text-indigo-400">{nodeMap.get(edges[activeEdge].from)?.label}</span>
            {" → "}
            <span className="text-violet-400">{nodeMap.get(edges[activeEdge].to)?.label}</span>
          </span>
        )}
      </motion.div>
    </div>
  );
}
