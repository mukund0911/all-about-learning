"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  label: string;
  depth: string;
  size: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (id: string) => void;
  activeNode?: string;
}

const DEPTH_COLORS: Record<string, string> = {
  foundational: "#06b6d4",
  core: "#6366f1",
  advanced: "#8b5cf6",
  supplementary: "#64748b",
};

export default function ConceptGraphViz({
  nodes,
  edges,
  onNodeClick,
  activeNode,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    depth: string;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = svgRef.current.clientWidth || 500;
    const H = svgRef.current.clientHeight || 380;

    // Defs — glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Arrow marker
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "rgba(99,102,241,0.5)");

    type SimNode = Node & d3.SimulationNodeDatum;
    type SimEdge = d3.SimulationLinkDatum<SimNode> & { label: string };

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const simEdges: SimEdge[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        label: e.label,
      }));

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(30));

    const container = svg.append("g");

    // Zoom
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 3])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        })
    );

    // Edges
    const link = container
      .append("g")
      .selectAll("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", "rgba(99,102,241,0.3)")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // Edge labels
    const linkLabel = container
      .append("g")
      .selectAll("text")
      .data(simEdges)
      .join("text")
      .attr("font-size", 9)
      .attr("fill", "rgba(148,163,184,0.6)")
      .attr("text-anchor", "middle")
      .text((d) => d.label);

    // Drag behavior
    const dragBehavior = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Nodes
    const node = container
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(dragBehavior);

    node
      .append("circle")
      .attr("r", (d) => 10 + d.size * 3)
      .attr("fill", (d) => {
        const col = DEPTH_COLORS[d.depth] || "#6366f1";
        return `${col}22`;
      })
      .attr("stroke", (d) => {
        const isActive = d.id === activeNode;
        return isActive
          ? "#06b6d4"
          : DEPTH_COLORS[d.depth] || "#6366f1";
      })
      .attr("stroke-width", (d) => (d.id === activeNode ? 2.5 : 1.5))
      .attr("filter", (d) =>
        d.id === activeNode ? "url(#glow)" : "none"
      );

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", (d) => Math.min(11, 8 + d.size))
      .attr("fill", (d) =>
        d.id === activeNode ? "#06b6d4" : "rgba(226,232,240,0.9)"
      )
      .attr("font-weight", (d) => (d.id === activeNode ? "bold" : "normal"))
      .text((d) => {
        const words = d.label.split(" ");
        return words.length > 2 ? words.slice(0, 2).join(" ") + "…" : d.label;
      });

    node.on("click", (_, d) => onNodeClick?.(d.id));
    node.on("mouseenter", (event, d) => {
      setTooltip({ x: event.pageX, y: event.pageY, label: d.label, depth: d.depth });
    });
    node.on("mouseleave", () => setTooltip(null));

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x || 0)
        .attr("y1", (d) => (d.source as SimNode).y || 0)
        .attr("x2", (d) => (d.target as SimNode).x || 0)
        .attr("y2", (d) => (d.target as SimNode).y || 0);

      linkLabel
        .attr(
          "x",
          (d) =>
            (((d.source as SimNode).x || 0) + ((d.target as SimNode).x || 0)) /
            2
        )
        .attr(
          "y",
          (d) =>
            (((d.source as SimNode).y || 0) + ((d.target as SimNode).y || 0)) /
            2
        );

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, activeNode, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg text-xs pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 30,
            background: "rgba(15,15,30,0.95)",
            border: "1px solid rgba(99,102,241,0.4)",
          }}
        >
          <div className="font-medium text-white">{tooltip.label}</div>
          <div
            className="text-xs mt-0.5 capitalize"
            style={{ color: DEPTH_COLORS[tooltip.depth] }}
          >
            {tooltip.depth}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex gap-3">
        {Object.entries(DEPTH_COLORS).map(([depth, color]) => (
          <span
            key={depth}
            className="flex items-center gap-1 text-xs text-slate-500 capitalize"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: color }}
            />
            {depth}
          </span>
        ))}
      </div>
    </div>
  );
}
