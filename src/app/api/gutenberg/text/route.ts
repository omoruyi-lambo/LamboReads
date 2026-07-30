import { NextRequest } from "next/server";
import { getBookFromCatalog } from "@/lib/books/catalog";
import { getReadTextUrl } from "@/lib/gutendex";
import { logApi } from "@/services/api";

export async function GET(req: NextRequest) {
  const bookId = Number(req.nextUrl.searchParams.get("bookId"));

  if (!Number.isInteger(bookId)) {
    return Response.json({ error: "bookId required" }, { status: 400 });
  }

  const book = await getBookFromCatalog(bookId);
  if (!book) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  const url = getReadTextUrl(book);
  if (!url) {
    return Response.json({ error: "No readable text format available" }, { status: 404 });
  }

  let res: globalThis.Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "text/plain,*/*;q=0.8",
      },
      cache: "force-cache",
    });
  } catch (error) {
    logApi.error("Failed to fetch Gutenberg text", { url, error });
    return Response.json({ error: "Failed to fetch source text" }, { status: 502 });
  }

  if (!res.ok || !res.body) {
    logApi.error("Gutenberg responded non-OK", { url, status: res.status });
    return Response.json({ error: "Source text unavailable" }, { status: 502 });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
