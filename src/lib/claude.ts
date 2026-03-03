import Anthropic from "@anthropic-ai/sdk";
import type { PaperAnalysis, ConceptSection } from "./types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Types for the skeleton phase
// ---------------------------------------------------------------------------

interface ConceptSkeleton {
  id: string;
  title: string;
  order: number;
  sourceSection: string;
  keyInsight: string;
  mathFormulation?: string;
  relatedConcepts: string[];
  prerequisites: string[];
  depth: "foundational" | "core" | "advanced" | "supplementary";
}

interface PaperSkeleton {
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string;
  readingOrder: string[];
  recommendedPath: string;
  concepts: ConceptSkeleton[];
  conceptGraph: {
    nodes: Array<{ id: string; label: string; depth: string; size: number }>;
    edges: Array<{ source: string; target: string; label: string }>;
  };
  keyContributions: string[];
  limitations: string[];
  tags: string[];
}

// ---------------------------------------------------------------------------
// Phase 1 — Extract paper skeleton (metadata + concept identification)
// ---------------------------------------------------------------------------

async function analyzePaperSkeleton(rawText: string): Promise<PaperSkeleton> {
  const systemPrompt = `You are an expert at analyzing academic research papers.
You extract structured metadata and identify key concepts, but you do NOT write content explanations in this step.
Always respond with valid JSON matching the exact schema requested. No markdown wrapping.`;

  const prompt = `Analyze this research paper and extract its structure.

PAPER TEXT:
${rawText.slice(0, 40000)}

Return a JSON object with this EXACT structure (no markdown wrapping, pure JSON):
{
  "title": "Full paper title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Full abstract",
  "year": 2024,
  "venue": "NeurIPS 2024 or arXiv or journal name",
  "readingOrder": ["Section names in optimal reading order"],
  "recommendedPath": "One paragraph explaining WHY this reading order helps",
  "concepts": [
    {
      "id": "concept_1",
      "title": "Concept name (e.g. 'Unified Detection as Regression')",
      "order": 1,
      "sourceSection": "Section 3.2, Appendix A",
      "keyInsight": "The single most important insight in one sentence",
      "mathFormulation": "Key equation in LaTeX if applicable",
      "relatedConcepts": ["concept_2"],
      "prerequisites": [],
      "depth": "foundational"
    }
  ],
  "conceptGraph": {
    "nodes": [{"id": "concept_1", "label": "Short name", "depth": "foundational", "size": 3}],
    "edges": [{"source": "concept_1", "target": "concept_2", "label": "enables"}]
  },
  "keyContributions": ["Contribution 1", "Contribution 2"],
  "limitations": ["Limitation 1"],
  "tags": ["deep-learning", "object-detection"]
}

Include exactly 4-5 concepts. For the "depth" field use: "foundational" | "core" | "advanced" | "supplementary".
Do NOT include any content/explanation text for concepts — just metadata.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    system: systemPrompt,
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let jsonStr = text
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  try {
    return JSON.parse(jsonStr) as PaperSkeleton;
  } catch {
    // Try extracting JSON object
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as PaperSkeleton;
    }
    throw new Error("Failed to parse skeleton response");
  }
}

// ---------------------------------------------------------------------------
// Phase 2 — Generate rich content for a single concept
// ---------------------------------------------------------------------------

async function generateConceptContent(
  rawText: string,
  concept: ConceptSkeleton,
  paperContext: { title: string; abstract: string }
): Promise<string> {
  const systemPrompt = `You are a brilliant, friendly teacher who explains research paper concepts like a knowledgeable friend over coffee.
You write in markdown. You're informal but precise — you use "you" and "we", contractions, and genuine enthusiasm.
You bridge intuition and formalism: start with the "why", build intuition, then introduce math, then connect them back.`;

  const prompt = `Write a rich, engaging explanation of this concept from the paper "${paperContext.title}".

Paper abstract: ${paperContext.abstract}

Concept: "${concept.title}"
Source section: ${concept.sourceSection}
Key insight: ${concept.keyInsight}
${concept.mathFormulation ? `Key math: ${concept.mathFormulation}` : ""}

Relevant paper text (use for direct quotes):
${rawText.slice(0, 20000)}

Write a comprehensive markdown explanation following this structure:

1. **Opening hook** — 2-3 sentences: what problem does this solve and why should we care?

2. **### sub-headings** for 2-4 sub-ideas

3. **Intuition first** — explain the core idea without jargon, use analogies

4. **Introduce the math** — when relevant, use $$...$$ for display math and $...$ for inline. After each equation, list what each variable means with bullet points.

5. **Bridge intuition and math** — explicitly connect the formal notation back to the intuitive understanding

6. **Cite the paper** — quote relevant passages as:
   > "exact quote from paper" — Section X.X

7. **Callouts** for important points:
   > **🎯 Objective:** what this component aims to achieve
   > **📊 Core Result:** the main finding
   > **💡 Key Insight:** the aha moment
   > **⚠️ Caveat:** limitations or gotchas

8. **Mermaid diagrams** when helpful for showing architecture, data flow, or processes:
   \`\`\`mermaid
   graph TD
       A[Input] --> B[Process]
   \`\`\`

9. **Code snippets** — pseudocode or Python when it clarifies an algorithm

10. **Comparison tables** — markdown tables for comparing approaches, methods, etc.

11. **Key takeaway** — a closing blockquote summarizing the main point

Style rules:
- Friendly, informal tone — like explaining to a smart friend
- Short paragraphs (2-4 sentences max)
- Use bullet lists liberally
- Be specific to THIS paper, not generic
- Target 400-600 words
- Do NOT wrap in JSON — just return raw markdown`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    system: systemPrompt,
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return text;
}

// ---------------------------------------------------------------------------
// Main entry point — orchestrates skeleton + parallel content generation
// ---------------------------------------------------------------------------

export async function analyzePaper(rawText: string): Promise<PaperAnalysis> {
  // Phase 1: Get paper skeleton
  const skeleton = await analyzePaperSkeleton(rawText);

  // Phase 2: Generate content for each concept in parallel
  const paperContext = {
    title: skeleton.title,
    abstract: skeleton.abstract,
  };

  const contentResults = await Promise.allSettled(
    skeleton.concepts.map((concept) =>
      generateConceptContent(rawText, concept, paperContext)
    )
  );

  // Assemble concept sections
  const conceptSections: ConceptSection[] = skeleton.concepts.map(
    (concept, i) => {
      const result = contentResults[i];
      const content =
        result.status === "fulfilled"
          ? result.value
          : `*Content generation failed for this concept. Please try re-analyzing the paper.*`;

      return {
        id: concept.id,
        title: concept.title,
        order: concept.order,
        sourceSection: concept.sourceSection,
        keyInsight: concept.keyInsight,
        mathFormulation: concept.mathFormulation,
        content,
        relatedConcepts: concept.relatedConcepts,
        prerequisites: concept.prerequisites,
        depth: concept.depth,
      };
    }
  );

  return {
    paperId: "",
    title: skeleton.title,
    authors: skeleton.authors,
    abstract: skeleton.abstract,
    year: skeleton.year,
    venue: skeleton.venue,
    readingOrder: skeleton.readingOrder,
    recommendedPath: skeleton.recommendedPath,
    conceptSections,
    conceptGraph: skeleton.conceptGraph,
    keyContributions: skeleton.keyContributions,
    limitations: skeleton.limitations,
    tags: skeleton.tags,
  };
}

// ---------------------------------------------------------------------------
// Streaming explanation for text selection
// ---------------------------------------------------------------------------

export async function explainSelection(
  selectedText: string,
  surroundingContext: string,
  paperTitle: string,
  sectionTitle: string
): Promise<ReadableStream<Uint8Array>> {
  const prompt = `You are explaining a concept from the research paper "${paperTitle}" (section: ${sectionTitle}).

The user selected this text:
"${selectedText}"

Surrounding context:
"${surroundingContext}"

Provide a rich, engaging explanation in markdown format. Write like a friendly, knowledgeable colleague — use "you" and "we", be informal but precise.

Include:
1. **What it means** — Direct explanation of the selected text
2. **Why it matters** — Its significance to the paper
3. **Intuition** — How to think about it, with analogies if helpful
4. **Technical details** — Precise formulation when relevant
5. **Mathematical foundation** — Equations with LaTeX ($...$ for inline, $$...$$ for display) if applicable

Use callouts for key points:
> **💡 Key Insight:** ...
> **⚠️ Caveat:** ...

Keep it concise but illuminating. Make the reader feel the insight.`;

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
