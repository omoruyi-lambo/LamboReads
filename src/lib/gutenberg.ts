/**
 * src/lib/gutenberg.ts
 *
 * Shared helpers for interacting with the Gutendex / Project Gutenberg API.
 * Used by admin import routes — NOT by the public website.
 */

const BASE     = "https://gutendex.com/books";
const TIMEOUT  = 15_000;
const UA       = "LamboReads-Admin/1.0 (https://lamboreads.com)";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

export interface GutendexPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function pickFormat(formats: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) if (formats[k]) return formats[k];
  return null;
}

export function getCoverUrl(book: GutendexBook): string | null {
  return pickFormat(book.formats, ["image/jpeg", "image/png"]);
}

export function getTextUrl(book: GutendexBook): string | null {
  return pickFormat(book.formats, [
    "text/html; charset=utf-8",
    "text/html",
    "text/plain; charset=utf-8",
    "text/plain",
  ]);
}

export function getEpubUrl(book: GutendexBook): string | null {
  return pickFormat(book.formats, ["application/epub+zip", "application/x-mobipocket-ebook"]);
}

export function getPdfUrl(book: GutendexBook): string | null {
  return pickFormat(book.formats, ["application/pdf"]);
}

export function buildBookRow(book: GutendexBook, adminId: string) {
  const author = book.authors.map((a) => a.name).join(", ") || "Unknown Author";
  const now    = new Date().toISOString();
  return {
    external_id:        String(book.id),
    normalized_title:   normalize(book.title),
    normalized_author:  normalize(author),
    title:              book.title,
    author,
    description:        book.subjects.slice(0, 8).join(" · ") || null,
    genre:              book.subjects[0] ?? null,
    language:           book.languages[0] ?? "en",
    cover_url:          getCoverUrl(book),
    book_url:           getTextUrl(book),
    book_type:          "free",
    status:             "published",
    downloads:          book.download_count ?? 0,
    views:              0,
    source:             "Project Gutenberg",
    imported_by:        adminId,
    created_at:         now,
    updated_at:         now,
  };
}

function normalize(v: string): string {
  return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

// ── Fetch with retry ──────────────────────────────────────────────────────────

export async function gutendexFetch(url: string, retries = 3): Promise<Response> {
  for (let i = 1; i <= retries; i++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "User-Agent": UA },
        cache: "no-store",
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw new Error("gutendexFetch: max retries exceeded");
}

export async function searchGutendex(params: {
  search?: string;
  author?: string;
  languages?: string;
  topic?: string;
  page?: number;
}): Promise<GutendexPage> {
  const url = new URL(BASE);
  if (params.search)    url.searchParams.set("search",    params.search);
  if (params.author)    url.searchParams.set("author",    params.author);
  if (params.languages) url.searchParams.set("languages", params.languages);
  if (params.topic)     url.searchParams.set("topic",     params.topic);
  if (params.page && params.page > 1) url.searchParams.set("page", String(params.page));

  const res = await gutendexFetch(url.toString());
  if (!res.ok) throw new Error(`Gutendex responded ${res.status}`);
  return res.json() as Promise<GutendexPage>;
}

export async function fetchGutendexBook(id: number): Promise<GutendexBook> {
  const res = await gutendexFetch(`${BASE}/${id}/`);
  if (!res.ok) throw new Error(`Gutendex responded ${res.status} for book ${id}`);
  return res.json() as Promise<GutendexBook>;
}
