export interface VisualizationSpec {
  type:
    | "neural_network"
    | "attention_heatmap"
    | "concept_graph"
    | "math_derivation"
    | "data_flow"
    | "transformer_arch"
    | "diffusion_process"
    | "loss_landscape"
    | "embedding_space"
    | "generic_animation"
    | "equation_breakdown";
  title: string;
  description: string;
  params: Record<string, unknown>;
}

export interface ConceptSection {
  id: string;
  title: string;
  order: number;
  sourceSection: string;
  keyInsight: string;
  mathFormulation?: string;
  content: string;
  relatedConcepts: string[];
  prerequisites: string[];
  depth: "foundational" | "core" | "advanced" | "supplementary";
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string;
  source: "upload" | "url";
  sourceUrl?: string;
  uploadedAt: number;
  tags: string[];
  readingTimeMinutes: number;
  conceptCount: number;
  thumbnailColor: string;
}

export interface PaperAnalysis {
  paperId: string;
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string;
  readingOrder: string[];
  recommendedPath: string;
  conceptSections: ConceptSection[];
  conceptGraph: {
    nodes: Array<{ id: string; label: string; depth: string; size: number }>;
    edges: Array<{ source: string; target: string; label: string }>;
  };
  keyContributions: string[];
  limitations: string[];
  tags: string[];
}

export interface TextSelectionContext {
  selectedText: string;
  surroundingContext: string;
  paperTitle: string;
  sectionTitle: string;
}

export interface StoredPaper {
  meta: Paper;
  analysis: PaperAnalysis;
  rawText: string;
}
