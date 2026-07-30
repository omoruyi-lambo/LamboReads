import { NextRequest, NextResponse } from "next/server";
import { getBooksFromCatalog } from "@/lib/books/catalog";

export async function GET(req: NextRequest) {
  const genres = req.nextUrl.searchParams.getAll("genres");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "12");
  const type = req.nextUrl.searchParams.get("type") || "recommended"; // recommended, trending, new

  try {
    if (!genres || genres.length === 0) {
      return NextResponse.json(
        { error: "No genres provided" },
        { status: 400 }
      );
    }

    const params: Record<string, string> = {
      sort: type === "trending" ? "popular" : "ascending",
      page: "1",
    };

    // Add topic search based on genres
    const genreSearches = genres.map((g) => g.toLowerCase());
    if (genreSearches.length > 0) {
      params.topic = genreSearches[0]; // Gutendex doesn't support multiple topics well
    }

    const data = await getBooksFromCatalog(params);

    // Return books from Gutendex only
    const recommendations = data.results.slice(0, limit);

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Some books are temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
