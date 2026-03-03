# CLAUDE.md — LensPaper

Research paper reader. Uploads/fetches PDFs, extracts text server-side with pdfjs-dist, sends to Claude AI for structured analysis, and renders rich markdown concept walkthroughs in the browser.

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 — always dark mode |
| AI | `@anthropic-ai/sdk` — model `claude-sonnet-4-6` |
| PDF parsing | `pdfjs-dist` (legacy build, server-side only) |
| Markdown | `react-markdown` + `remark-math` + `rehype-katex` + `rehype-highlight` |
| 2D graphs | D3.js (force-directed concept graph in sidebar only) |
| Math rendering | KaTeX (via rehype-katex in markdown, and standalone) |
| Animations | Framer Motion (page transitions, panel slides — not content) |
| Storage | IndexedDB (full data) + localStorage (metadata list) |
| State | Zustand |

## Project Structure

```
src/
  app/
    api/
      upload/route.ts       # PDF upload + URL fetch + Claude analysis
      explain/route.ts      # Text selection streaming explanation
    library/page.tsx        # Paper grid with search/delete
    paper/[id]/page.tsx     # Paper viewer: sidebar + scrollable concept docs
    globals.css             # Design tokens, Google Fonts, global styles
    layout.tsx              # Root layout — loads Geist fonts via geist package
    page.tsx                # Editorial home page (hero, features, depth grid)
  components/
    layout/Navigation.tsx
    library/PaperCard.tsx
    paper/
      ConceptSection.tsx    # Always-visible rich markdown section (no accordion)
      DepthControl.tsx      # 1–3 depth level bar selector
      TextSelectionPanel.tsx # Select text → EXPLAIN → streaming side panel
    upload/UploadZone.tsx
    visualizations/         # Legacy viz components — NOT imported by paper view
      ConceptGraphViz.tsx   # D3 force-directed (still used in sidebar)
      NeuralNetworkViz.tsx, AttentionHeatmap.tsx, DataFlowViz.tsx,
      EmbeddingSpaceViz.tsx, DiffusionProcessViz.tsx, MathDerivation.tsx,
      ParticleBackground.tsx, VisualizationContainer.tsx  # unused, kept for now
  lib/
    types.ts      # All TypeScript interfaces
    storage.ts    # IndexedDB wrapper + localStorage helpers
    claude.ts     # analyzePaper() + explainSelection() (streaming)
    utils.ts      # generateId(), randomThumbnailColor()
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

Required in `.env.local`. Both API routes fail without it.

## Development

```bash
npm install
npm run dev      # Turbopack on http://localhost:3000
npm run build    # tsc + next build
npm run lint
```

## Design System

### Fonts

Loaded via the `geist` npm package in `layout.tsx`:

```tsx
import { GeistMono } from "geist/font/mono";
import { GeistPixelCircle } from "geist/font/pixel";
```

- **GeistPixelCircle** — hero headline h1
- **GeistMono** (`var(--font-geist-mono)`) — nav, labels, section indices, mono UI
- **DM Serif Display** (italic, Google Fonts) — concept titles, paper title, stat numbers
- **Space Mono** (Google Fonts) — code blocks, secondary mono labels, subsection headings
- **Inter** (Google Fonts) — body/paragraph text

> **Do not use Google Fonts URLs for Geist.** Always use the `geist` npm package.

### Color Tokens (`globals.css`)

```css
--ink:       #0b0b0b   /* page background */
--ink-2:     #141414   /* surface */
--wire:      #242424   /* borders, rules */
--ghost:     #3a3a3a   /* subtle borders */
--mist:      #666666   /* secondary text */
--text:      #f0ece4   /* primary text */
--text-2:    #888888   /* dimmed text */
--flash:     #c8ff00   /* accent (chartreuse) */
--flash-dim: rgba(200,255,0,0.07)  /* accent bg tint */
```

Inner pages also reference legacy compat vars (`--bg-base`, `--accent-indigo`, etc.) — keep those.

### Layout Aesthetic

Editorial/brutalist:
- Section indices: `01` in Space Mono with `--flash` color
- Ruled horizontal rows with `border-top: 1px solid var(--wire)`
- Hero: `flex flex-col lg:flex-row` — headline left, UploadZone right (480px fixed width)
- Paper view: sidebar (240px) + scrollable main content, all sections always visible

## Key Implementation Notes

### Paper View Architecture

The paper viewer (`paper/[id]/page.tsx`) uses a **continuous document layout** — no accordions or toggles:
- All concept sections render fully expanded, one after another
- Sidebar nav highlights based on scroll position via `IntersectionObserver`
- Clicking a sidebar item smooth-scrolls to that section via `scrollIntoView`
- Abstract is justified (`text-align: justify`)
- Depth switching re-renders all sections with the selected depth's content

### Content Model

Each concept has `contentByDepth: [string, string, string]` — three complete markdown documents:
- **Level 1 (Intuitive):** No math, analogies in prose, flowcharts + tables. ~200-300 words.
- **Level 2 (Balanced):** Light notation with annotations, architectural diagrams. ~250-350 words.
- **Level 3 (Technical):** Full equations with variable annotations, proofs. ~300-400 words.

Content uses structured markdown: `###` sub-headings, fenced code block flowcharts with arrows, `$$` math blocks followed by variable annotation bullet lists, `> **Problem:**` / `> **Solution:**` blockquotes, comparison tables, and key takeaway blockquotes.

### Depth Levels

```ts
export type DepthLevel = 1 | 2 | 3;
// 1 = Intuitive (analogies, no jargon)
// 2 = Balanced  (key ideas + light notation)  ← default
// 3 = Technical (full formulations & proofs)
```

### ConceptSection Type

```ts
interface ConceptSection {
  id: string;
  title: string;
  order: number;
  sourceSection: string;
  keyInsight: string;
  mathFormulation?: string;
  contentByDepth: [string, string, string];
  relatedConcepts: string[];
  prerequisites: string[];
  depth: "foundational" | "core" | "advanced" | "supplementary";
}
```

No `visualization`, `analogies`, `simpleExplanation`, `technicalExplanation`, or `explanationsByDepth` fields.

### PDF Parsing (Server-side)

Uses `pdfjs-dist/legacy/build/pdf.mjs` with a required workerSrc fix:

```ts
GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;
```

`pathToFileURL` needed on Windows. `next.config.ts` must list `pdfjs-dist` (and `canvas`) in `serverExternalPackages`.

### Claude API (`src/lib/claude.ts`)

- `analyzePaper(text)` — 16000 max tokens, returns `PaperAnalysis` JSON. Includes `repairTruncatedJson()` fallback for when output hits token limit mid-JSON.
- `explainSelection(...)` — 2048 max tokens, returns a `ReadableStream<Uint8Array>` of text deltas (streamed to client).
- Both use model `claude-sonnet-4-6`

**Token budget issue:** The prompt asks for 4-5 concepts x 3 depths x 200-400 words. This is tight for 16K output tokens. The `repairTruncatedJson()` function closes unterminated strings/arrays/objects so partial responses still parse. If truncation is frequent, reduce concept count or word targets.

### Streaming Explain Endpoint

`/api/explain` returns a streaming `Response` (not JSON). The client (`TextSelectionPanel.tsx`) reads chunks via `res.body.getReader()` and appends text incrementally with a pulsing cursor indicator.

### Client-side Storage (`src/lib/storage.ts`)

- IndexedDB: full `StoredPaper` object keyed by paper ID
- localStorage: lightweight `Paper[]` metadata for fast library listing
- No backend database — all data lives in the browser

### Markdown Rendering Stack

ConceptSection and TextSelectionPanel both render markdown with:
- `react-markdown` — base renderer
- `remark-math` — parse `$...$` and `$$...$$` blocks
- `rehype-katex` — render LaTeX math
- `rehype-highlight` — syntax-highlighted code blocks
- Custom CSS scoped via `.concept-content` / `.explain-content` class names

## Branch & CI

- **Main is branch-protected** — merge only via GitHub PR, never direct push
- **CI** (`.github/workflows/ci.yml`): Node.js 20, runs `tsc --noEmit` + `npm run build`
