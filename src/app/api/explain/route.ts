import { NextRequest } from "next/server";
import { explainSelection } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      selectedText,
      surroundingContext,
      paperTitle,
      sectionTitle,
    } = body;

    if (!selectedText) {
      return new Response(
        JSON.stringify({ error: "selectedText is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await explainSelection(
      selectedText,
      surroundingContext || "",
      paperTitle || "Research Paper",
      sectionTitle || "Unknown Section"
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Explain error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate explanation",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
