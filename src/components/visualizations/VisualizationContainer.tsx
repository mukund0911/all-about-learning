"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { VisualizationSpec } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NeuralNetworkViz = dynamic<any>(() => import("./NeuralNetworkViz"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AttentionHeatmap = dynamic<any>(() => import("./AttentionHeatmap"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConceptGraphViz = dynamic<any>(() => import("./ConceptGraphViz"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MathDerivation = dynamic<any>(() => import("./MathDerivation"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataFlowViz = dynamic<any>(() => import("./DataFlowViz"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EmbeddingSpaceViz = dynamic<any>(() => import("./EmbeddingSpaceViz"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DiffusionProcessViz = dynamic<any>(() => import("./DiffusionProcessViz"), { ssr: false });

interface Props {
  spec: VisualizationSpec;
  activeNode?: string;
  onNodeClick?: (id: string) => void;
}

export default function VisualizationContainer({ spec, activeNode, onNodeClick }: Props) {
  const params = spec.params as Record<string, unknown>;

  const renderViz = () => {
    switch (spec.type) {
      case "neural_network":
        return (
          <NeuralNetworkViz
            layers={(params.layers as number[]) || [4, 6, 8, 6, 2]}
            animated={true}
          />
        );

      case "attention_heatmap":
        return (
          <AttentionHeatmap
            tokens={(params.tokens as string[]) || undefined}
          />
        );

      case "concept_graph":
        return (
          <ConceptGraphViz
            nodes={params.nodes ?? []}
            edges={params.edges ?? []}
            activeNode={activeNode}
            onNodeClick={onNodeClick}
          />
        );

      case "math_derivation":
      case "equation_breakdown":
        return (
          <MathDerivation
            equations={(params.equations as string[]) ?? []}
            mainEquation={(params.mainEquation as string) ?? undefined}
          />
        );

      case "data_flow":
      case "transformer_arch":
        return (
          <DataFlowViz
            nodes={params.nodes ?? undefined}
            edges={params.edges ?? undefined}
          />
        );

      case "embedding_space":
        return (
          <EmbeddingSpaceViz
            clusters={(params.clusters as number) || 5}
            pointsPerCluster={(params.pointsPerCluster as number) || 40}
          />
        );

      case "diffusion_process":
        return <DiffusionProcessViz />;

      case "loss_landscape":
        return (
          <EmbeddingSpaceViz clusters={3} pointsPerCluster={25} />
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <NeuralNetworkViz layers={[3, 5, 7, 5, 3]} animated />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300">{spec.title}</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{spec.description}</p>
      </div>

      {/* Visualization */}
      <div className="flex-1 min-h-0 relative">
        {renderViz()}
      </div>
    </motion.div>
  );
}
