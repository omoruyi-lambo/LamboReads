import type { GutenbergBook, GutendexResponse } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

const PROVIDER      = "https://gutendex.com/books";
const CACHE_SECONDS = Number(process.env.BOOK_PROVIDER_CACHE_SECONDS ?? 3600);
const TIMEOUT_MS    = Number(process.env.BOOK_PROVIDER_TIMEOUT_MS ?? 8000);

// In-flight deduplication: prevents parallel requests for the same key
const inflight = new Map<string, Promise<GutendexResponse | GutenbergBook | null>>();

type CatalogRow = {
  id: string | number; external_id: string | null; title: string;
  author: string | null; description: string | null; genre: string | null;
  language: string | null; cover_url: string | null; book_url: string | null;
  pages: number | null; reading_time: number | null;
  views: number | null; downloads: number | null; status: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function log(event: string, data?: unknown) {
  if (process.env.NODE_ENV !== "test") {
    console.info(`[book-catalog] ${event}`, data ?? "");
  }
}

function rowToBook(row: CatalogRow): GutenbergBook {
  return {
    id: Number(row.external_id ?? row.id),
    title: row.title,
    authors: [{ name: row.author ?? "Unknown Author", birth_year: null, death_year: null }],
    subjects: row.genre ? [row.genre] : [],
    bookshelves: [],
    languages: row.language ? [row.language] : [],
    copyright: false,
    media_type: "Text",
    formats: {
      ...(row.cover_url ? { "image/jpeg": row.cover_url } : {}),
      ...(row.book_url  ? { "text/plain": row.book_url  } : {}),
    },
    download_count: row.downloads ?? 0,
  };
}

function validExternalBook(v: unknown): v is GutenbergBook {
  const b = v as GutenbergBook;
  return Boolean(b && Number.isInteger(b.id) && typeof b.title === "string"
    && Array.isArray(b.authors) && b.formats && typeof b.formats === "object");
}

// ── External provider (Gutendex) ─────────────────────────────────────────────

async function provider<T extends GutendexResponse | GutenbergBook | null>(
  url: string,
  key: string
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) { log("inflight-hit", key); return existing as Promise<T>; }

  const task = (async (): Promise<T> => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();
      const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        log("provider-attempt", { key, attempt });
        const res = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: CACHE_SECONDS },
          headers: {
            // Some providers block requests without a User-Agent
            "User-Agent": "LamboReads/1.0 (https://lamboreads.com)",
          },
        });

        if (!res.ok) throw new Error(`provider status ${res.status}`);
        const data = await res.json();
        if (Array.isArray((data as GutendexResponse).results)) return data as T;
        if (validExternalBook(data)) return data as T;
        throw new Error("provider returned invalid shape");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        log("provider-failure", { key, attempt, error: msg });
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
      } finally {
        clearTimeout(timer);
      }
    }
    log("provider-exhausted", key);
    return null as T;
  })();

  inflight.set(key, task);
  task.finally(() => inflight.delete(key));
  return task;
}

// ── Supabase cache write (best-effort, never blocks the response) ─────────────

async function importBooks(books: GutenbergBook[]): Promise<GutenbergBook[]> {
  if (!supabaseAdmin) {
    log("import-skip", "supabaseAdmin not available");
    return books;
  }
  const valid = books.filter(validExternalBook);
  if (!valid.length) return [];

  const rows = valid.map((book) => {
    const author  = book.authors?.map((a) => a.name).join(", ") || "Unknown Author";
    const cover   = book.formats?.["image/jpeg"] ?? book.formats?.["image/png"] ?? null;
    const text    = book.formats?.["text/plain; charset=utf-8"] ?? book.formats?.["text/plain"] ?? null;
    return {
      external_id:        String(book.id),
      normalized_title:   normalize(book.title),
      normalized_author:  normalize(author),
      title:              book.title,
      author,
      description:        book.subjects?.slice(0, 5).join(" · ") || null,
      genre:              book.subjects?.[0] ?? null,
      language:           book.languages?.[0] ?? "English",
      cover_url:          cover,
      book_url:           text,
      pages:              null,
      reading_time:       null,
      book_type:          "free",
      status:             "published",
      downloads:          book.download_count ?? 0,
      views:              0,
      created_at:         new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    };
  });

  const { error } = await supabaseAdmin
    .from("books")
    .upsert(rows, { onConflict: "external_id", ignoreDuplicates: false });

  if (error) {
    log("import-failure", error.message);
    // Return the original books so they still display even if caching failed
    return valid;
  }

  log("import-success", valid.length);
  return valid;
}

// ── Supabase query ────────────────────────────────────────────────────────────

async function localRows(params: {
  id?: number; search?: string; genre?: string;
  page?: number; limit?: number; sort?: string;
}): Promise<{ rows: CatalogRow[]; count: number }> {
  if (!supabaseAdmin) return { rows: [], count: 0 };

  const limit = params.limit ?? 24;
  const page  = params.page  ?? 1;

  let query = supabaseAdmin
    .from("books")
    .select(
      "id,external_id,title,author,description,genre,language,cover_url,book_url,pages,reading_time,views,downloads,status",
      { count: "exact" }
    )
    .eq("status", "published")
    .is("deleted_at", null);

  if (params.id      !== undefined) query = query.eq("external_id", String(params.id));
  if (params.search)               query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%,genre.ilike.%${params.search}%`);
  if (params.genre)                query = query.ilike("genre", `%${params.genre}%`);

  query = query.order(
    params.sort === "ascending" ? "created_at" : "views",
    { ascending: params.sort === "ascending" }
  );
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;
  if (error) { log("local-query-failure", error.message); return { rows: [], count: 0 }; }
  return { rows: (data ?? []) as CatalogRow[], count: count ?? 0 };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getBookFromCatalog(id: number): Promise<GutenbergBook | null> {
  // 1. Try Supabase first (fast, no external call)
  const local = await localRows({ id, limit: 1 });
  if (local.rows[0]) { log("local-hit", id); return rowToBook(local.rows[0]); }

  // 2. Fall back to Gutendex
  log("local-miss", id);
  const external = await provider<GutenbergBook>(`${PROVIDER}/${id}/`, `book:${id}`);
  if (!external) return null;

  // Cache in Supabase asynchronously (don't await — return immediately)
  importBooks([external]).catch(() => {});
  return external;
}

export async function refreshBookMetadata(id: number): Promise<boolean> {
  const external = await provider<GutenbergBook>(`${PROVIDER}/${id}/`, `refresh:${id}:${Date.now()}`);
  if (!external) return false;
  return (await importBooks([external])).length > 0;
}

/**
 * Primary list function used by /api/books and HomeFreeBooks.
 *
 * Strategy:
 *  1. Query Supabase for cached books.
 *  2. Regardless of how many Supabase books exist, ALSO query Gutendex.
 *  3. Merge both sources, deduplicate by id, Supabase takes precedence.
 *  4. If Gutendex fails, gracefully return whatever Supabase has (even zero).
 *
 * This ensures the homepage always shows books even when Supabase is empty.
 */
export async function getBooksFromCatalog(
  params: Record<string, string> = {}
): Promise<GutendexResponse> {
  const page   = Math.max(1, Number(params.page ?? 1));
  const search = params.search ?? params.title ?? params.topic;

  // ── Step 1: Supabase ───────────────────────────────────────────
  const local = await localRows({ search, genre: params.genre, page, limit: 24, sort: params.sort });
  log("supabase-count", local.rows.length);

  // ── Step 2: Gutendex ───────────────────────────────────────────
  const key      = `list:${new URLSearchParams(params).toString()}`;
  const external = await provider<GutendexResponse>(`${PROVIDER}/?${new URLSearchParams(params)}`, key);
  log("gutendex-count", external?.results?.length ?? 0);

  // ── Step 3: Merge ──────────────────────────────────────────────
  const supabaseBooks  = local.rows.map(rowToBook);
  const supabaseIds    = new Set(supabaseBooks.map((b) => b.id));
  const externalBooks  = (external?.results ?? []).filter((b) => !supabaseIds.has(b.id));
  const merged         = [...supabaseBooks, ...externalBooks];
  log("merged-count", merged.length);

  // ── Step 4: Cache Gutendex books into Supabase (fire-and-forget) ─
  if (externalBooks.length > 0) {
    importBooks(externalBooks).catch(() => {});
  }

  // ── Step 5: Return ────────────────────────────────────────────
  const totalCount = (local.count ?? 0) + (external?.count ?? 0) - (external?.results ?? []).length + externalBooks.length;
  return {
    count:    Math.max(merged.length, totalCount),
    next:     external?.next    ?? null,
    previous: external?.previous ?? (page > 1 ? "prev" : null),
    results:  merged,
  };
}

/**
 * Supabase-only query — used internally where external books aren't needed.
 */
export async function getLocalBooks(
  params: Record<string, string> = {}
): Promise<GutendexResponse> {
  const page  = Math.max(1, Number(params.page ?? 1));
  const local = await localRows({
    search: params.search ?? params.title ?? params.topic,
    genre:  params.genre,
    page,
    limit:  24,
    sort:   params.sort,
  });
  return {
    count:    local.count,
    next:     null,
    previous: page > 1 ? "local" : null,
    results:  local.rows.map(rowToBook),
  };
}
