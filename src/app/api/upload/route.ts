import { NextRequest, NextResponse } from "next/server";
import { analyzePaper } from "@/lib/claude";
import { generateId, randomThumbnailColor } from "@/lib/utils";
import type { StoredPaper } from "@/lib/types";
import path from "path";
import { pathToFileURL } from "url";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

// pathToFileURL converts Windows paths (D:\...) to file:// URLs required by the ESM loader
GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;

async function parsePdfBuffer(data: ArrayBuffer): Promise<string> {
  const doc = await getDocument({ data }).promise;
  const chunks: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
      .join(" ");
    chunks.push(pageText);
  }

  return chunks.join("\n\n");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let rawText = "";
    let source: "upload" | "url" = "upload";
    let sourceUrl: string | undefined;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      rawText = await parsePdfBuffer(arrayBuffer);
    } else if (url) {
      source = "url";
      sourceUrl = url;

      const response = await fetch(url, {
        headers: { "User-Agent": "PaperVis/1.0 Academic Paper Visualizer" },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch paper from URL" },
          { status: 400 }
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/pdf")) {
        const arrayBuffer = await response.arrayBuffer();
        rawText = await parsePdfBuffer(arrayBuffer);
      } else {
        rawText = await response.text();
        rawText = rawText
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 }
      );
    }

    if (!rawText || rawText.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the paper" },
        { status: 400 }
      );
    }

    // Analyze with Claude
    const analysis = await analyzePaper(rawText);
    const id = generateId();
    analysis.paperId = id;

    const wordCount = rawText.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    const stored: StoredPaper = {
      meta: {
        id,
        title: analysis.title,
        authors: analysis.authors,
        abstract: analysis.abstract,
        year: analysis.year,
        venue: analysis.venue,
        source,
        sourceUrl,
        uploadedAt: Date.now(),
        tags: analysis.tags,
        readingTimeMinutes,
        conceptCount: analysis.conceptSections.length,
        thumbnailColor: randomThumbnailColor(),
      },
      analysis,
      rawText: rawText.slice(0, 100000),
    };

    return NextResponse.json({ success: true, paper: stored });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process paper",
      },
      { status: 500 }
    );
  }
}
