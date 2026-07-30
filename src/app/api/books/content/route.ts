import { NextRequest, NextResponse } from "next/server";
import { findPublishedBook } from "@/lib/books/lookup";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getBookFromCatalog } from "@/lib/books/catalog";
import { getReadTextUrl } from "@/lib/gutendex";

function stripMarkup(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseSupabaseStorageObject(url: URL): { bucket: string; path: string } | null {
  const match = url.pathname.match(
    /^\/storage\/v1\/object\/(?:public|authenticated|sign)\/([^/]+)\/(.+)$/
  );
  if (!match) return null;
  const bucket = match[1];
  const path = decodeURIComponent(match[2]);
  return { bucket, path };
}

function jsonError(
  status: number,
  payload: { error: string; code: string; details?: Record<string, unknown> }
) {
  return NextResponse.json(payload, { status });
}

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return jsonError(400, { error: "bookId is required", code: "invalid_request" });

  const providerId = Number(bookId);
  const isProviderId = Number.isInteger(providerId);

  let book;
  try {
    book = await findPublishedBook(bookId);
  } catch {
    book = null;
  }
  if (!book && isProviderId) {
    const external = await getBookFromCatalog(providerId);
    if (!external) return jsonError(404, { error: "Book not found", code: "book_not_found" });
    const url = getReadTextUrl(external);
    if (!url) return jsonError(404, { error: "No readable text format available", code: "book_file_missing" });
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "text/plain,*/*;q=0.8" },
        cache: "force-cache",
      });
    } catch {
      return jsonError(502, { error: "Source text unavailable", code: "source_unavailable" });
    }

    if (!res.ok) {
      if (res.status === 404) return jsonError(404, { error: "Book file missing", code: "book_file_missing" });
      if (res.status === 401 || res.status === 403) return jsonError(403, { error: "Permission denied for book file", code: "permission_denied" });
      return jsonError(502, { error: "Source text unavailable", code: "source_unavailable", details: { upstreamStatus: res.status } });
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text") && !contentType.includes("html") && !url.match(/\.(txt|html?)($|\?)/i)) {
      return jsonError(415, { error: "Unsupported book format", code: "unsupported_format" });
    }

    return new NextResponse(stripMarkup(await res.text()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  if (!book) return jsonError(404, { error: "Book not found", code: "book_not_found" });
  if (!book.book_url) return jsonError(404, { error: "Book file missing", code: "book_file_missing" });

  let url: URL;
  try {
    url = new URL(book.book_url);
  } catch {
    return jsonError(422, { error: "Book file path is invalid", code: "invalid_storage_path" });
  }

  const configUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSameProjectStorage =
    Boolean(configUrl) && url.origin === new URL(configUrl!).origin && url.pathname.includes("/storage/v1/object/");

  if (isSameProjectStorage && supabaseAdmin) {
    const object = parseSupabaseStorageObject(url);
    if (!object) {
      return jsonError(422, { error: "Book file path is invalid", code: "invalid_storage_path" });
    }

    const { data, error } = await supabaseAdmin.storage
      .from(object.bucket)
      .download(object.path);

    if (error || !data) {
      const status = Number((error as any)?.statusCode ?? (error as any)?.status ?? 0);
      if (status === 404) return jsonError(404, { error: "Book file missing", code: "book_file_missing" });
      if (status === 401 || status === 403) return jsonError(403, { error: "Permission denied for book file", code: "permission_denied" });
      return jsonError(503, { error: "Storage unavailable", code: "storage_unavailable" });
    }

    const contentType = (data as any).type ?? "";
    if (
      !contentType.includes("text") &&
      !contentType.includes("html") &&
      !book.book_url.match(/\.(txt|html?)($|\?)/i)
    ) {
      return jsonError(415, { error: "Unsupported book format", code: "unsupported_format" });
    }

    return new NextResponse(stripMarkup(await data.text()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  let response: Response;
  try {
    response = await fetch(book.book_url, { next: { revalidate: 300 } });
  } catch {
    return jsonError(503, { error: "Storage unavailable", code: "storage_unavailable" });
  }

  if (!response.ok && isSameProjectStorage && supabaseAdmin) {
    const object = parseSupabaseStorageObject(url);
    if (object) {
      const signed = await supabaseAdmin.storage
        .from(object.bucket)
        .createSignedUrl(object.path, 300);
      if (signed.data?.signedUrl) {
        response = await fetch(signed.data.signedUrl, { next: { revalidate: 300 } });
      }
    }
  }

  if (!response.ok) {
    if (response.status === 404) return jsonError(404, { error: "Book file missing", code: "book_file_missing" });
    if (response.status === 401 || response.status === 403) return jsonError(403, { error: "Permission denied for book file", code: "permission_denied" });
    if (response.status >= 500) return jsonError(503, { error: "Storage unavailable", code: "storage_unavailable" });
    return jsonError(502, { error: "Unable to download book file", code: "storage_unavailable", details: { upstreamStatus: response.status } });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("text") &&
    !contentType.includes("html") &&
    !book.book_url.match(/\.(txt|html?)($|\?)/i)
  ) {
    return jsonError(415, { error: "Unsupported book format", code: "unsupported_format" });
  }

  return new NextResponse(stripMarkup(await response.text()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
