import type { GutenbergBook, GutendexResponse } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

const PROVIDER = "https://gutendex.com/books";
const CACHE_SECONDS = Number(process.env.BOOK_PROVIDER_CACHE_SECONDS ?? 3600);
const TIMEOUT_MS = Number(process.env.BOOK_PROVIDER_TIMEOUT_MS ?? 8000);
const inflight = new Map<string, Promise<GutendexResponse | GutenbergBook | null>>();

type CatalogRow = { id: string | number; external_id: string | null; title: string; author: string | null; description: string | null; genre: string | null; language: string | null; cover_url: string | null; book_url: string | null; pages: number | null; reading_time: number | null; views: number | null; downloads: number | null; status: string | null };

function normalize(value: string | null | undefined) { return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }
function log(event: string, data?: unknown) { if (process.env.NODE_ENV !== "test") console.info(`[book-catalog] ${event}`, data ?? ""); }
function rowToBook(row: CatalogRow): GutenbergBook { return { id: Number(row.external_id ?? row.id), title: row.title, authors: [{ name: row.author ?? "Unknown Author", birth_year: null, death_year: null }], subjects: row.genre ? [row.genre] : [], bookshelves: [], languages: row.language ? [row.language] : [], copyright: false, media_type: "Text", formats: { ...(row.cover_url ? { "image/jpeg": row.cover_url } : {}), ...(row.book_url ? { "text/plain": row.book_url } : {}) }, download_count: row.downloads ?? 0 }; }
function validExternalBook(value: unknown): value is GutenbergBook { const book = value as GutenbergBook; return Boolean(book && Number.isInteger(book.id) && typeof book.title === "string" && Array.isArray(book.authors) && book.formats && typeof book.formats === "object"); }

async function provider<T extends GutendexResponse | GutenbergBook | null>(url: string, key: string): Promise<T> {
  const existing = inflight.get(key); if (existing) { log("cache/inflight-hit", key); return existing as Promise<T>; }
  const task = (async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        log("provider-attempt", { key, attempt });
        const response = await fetch(url, { signal: controller.signal, next: { revalidate: CACHE_SECONDS } });
        if (!response.ok) throw new Error(`provider status ${response.status}`);
        const data = await response.json();
        if (Array.isArray((data as GutendexResponse).results)) return data as T;
        if (validExternalBook(data)) return data as T;
        throw new Error("provider returned invalid data");
      } catch (error) { log("provider-failure", { key, attempt, error: error instanceof Error ? error.message : "unknown" }); if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1))); }
      finally { clearTimeout(timer); }
    }
    return null;
  })();
  inflight.set(key, task); task.finally(() => inflight.delete(key)); return task as Promise<T>;
}

async function importBooks(books: GutenbergBook[]): Promise<GutenbergBook[]> {
  if (!supabaseAdmin) return books;
  const admin = supabaseAdmin;
  const valid = books.filter(validExternalBook); if (!valid.length) return [];
  const rows = valid.map((book) => { const author = book.authors?.map((item) => item.name).join(", ") || "Unknown Author"; const cover = book.formats?.["image/jpeg"] ?? book.formats?.["image/png"] ?? null; const text = book.formats?.["text/plain; charset=utf-8"] ?? book.formats?.["text/plain"] ?? null; return { external_id: String(book.id), normalized_title: normalize(book.title), normalized_author: normalize(author), title: book.title, author, description: book.subjects?.slice(0, 5).join(" · ") || null, genre: book.subjects?.[0] ?? null, language: book.languages?.[0] ?? "English", cover_url: cover, book_url: text, pages: null, reading_time: null, book_type: "free", status: "published", downloads: book.download_count ?? 0, views: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; });
  const { error } = await supabaseAdmin.from("books").upsert(rows, { onConflict: "external_id", ignoreDuplicates: false });
  if (error) { log("import-failure", error.message); return valid; }
  await Promise.all(valid.map(async (book) => {
    const source = book.formats?.["image/jpeg"] ?? book.formats?.["image/png"];
    if (!source) return;
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: CACHE_SECONDS } });
      if (!response.ok) return;
      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      const path = `provider/${book.id}.${contentType.includes("png") ? "png" : "jpg"}`;
      const upload = await admin.storage.from("book-covers").upload(path, await response.arrayBuffer(), { contentType, upsert: true });
      if (upload.error) { log("cover-cache-failure", { id: book.id, error: upload.error.message }); return; }
      const { data } = admin.storage.from("book-covers").getPublicUrl(path);
      await admin.from("books").update({ cover_url: data.publicUrl }).eq("external_id", String(book.id));
    } catch (error) { log("cover-cache-failure", { id: book.id, error: error instanceof Error ? error.message : "unknown" }); }
  }));
  await Promise.all(valid.map(async (book) => {
    const source = book.formats?.["text/plain; charset=utf-8"] ?? book.formats?.["text/plain"];
    if (!source) return;
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: CACHE_SECONDS } });
      if (!response.ok) return;
      const path = `provider/${book.id}.txt`;
      const upload = await admin.storage.from("books").upload(path, await response.arrayBuffer(), { contentType: "text/plain; charset=utf-8", upsert: true });
      if (upload.error) { log("book-file-cache-failure", { id: book.id, error: upload.error.message }); return; }
      const { data } = admin.storage.from("books").getPublicUrl(path);
      await admin.from("books").update({ book_url: data.publicUrl }).eq("external_id", String(book.id));
    } catch (error) { log("book-file-cache-failure", { id: book.id, error: error instanceof Error ? error.message : "unknown" }); }
  }));
  log("import-success", valid.length); return valid;
}

async function localRows(params: { id?: number; search?: string; genre?: string; page?: number; limit?: number; sort?: string }) {
  if (!supabaseAdmin) return { rows: [] as CatalogRow[], count: 0 };
  const limit = params.limit ?? 24; const page = params.page ?? 1;
  let query = supabaseAdmin.from("books").select("id,external_id,title,author,description,genre,language,cover_url,book_url,pages,reading_time,views,downloads,status", { count: "exact" }).eq("status", "published").is("deleted_at", null);
  if (params.id !== undefined) query = query.eq("external_id", String(params.id));
  if (params.search) query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%,genre.ilike.%${params.search}%`);
  if (params.genre) query = query.ilike("genre", `%${params.genre}%`);
  query = query.order(params.sort === "ascending" ? "created_at" : "views", { ascending: params.sort === "ascending" });
  query = query.range((page - 1) * limit, page * limit - 1);
  const { data, count, error } = await query; if (error) { log("local-query-failure", error.message); return { rows: [], count: 0 }; }
  return { rows: (data ?? []) as CatalogRow[], count: count ?? 0 };
}

export async function getBookFromCatalog(id: number): Promise<GutenbergBook | null> {
  const local = await localRows({ id, limit: 1 }); if (local.rows[0]) { log("local-hit", id); return rowToBook(local.rows[0]); }
  log("local-miss", id); const external = await provider<GutenbergBook>(`${PROVIDER}/${id}/`, `book:${id}`); if (!external) return null; const imported = await importBooks([external]); return imported[0] ?? null;
}

export async function refreshBookMetadata(id: number): Promise<boolean> {
  const external = await provider<GutenbergBook>(`${PROVIDER}/${id}/`, `refresh:${id}:${Date.now()}`);
  if (!external) return false;
  return (await importBooks([external])).length > 0;
}

export async function getBooksFromCatalog(params: Record<string, string> = {}): Promise<GutendexResponse> {
  const page = Math.max(1, Number(params.page ?? 1)); const search = params.search ?? params.title ?? params.topic; const local = await localRows({ search, genre: params.genre, page, limit: 24, sort: params.sort });
  if (local.rows.length) { log("local-list-hit", { search, count: local.rows.length }); return { count: local.count, next: null, previous: page > 1 ? "local" : null, results: local.rows.map(rowToBook) }; }
  log("local-list-miss", search); const key = `list:${new URLSearchParams(params).toString()}`; const external = await provider<GutendexResponse>(`${PROVIDER}/?${new URLSearchParams(params)}`, key); if (!external) return { count: 0, next: null, previous: null, results: [] }; const imported = await importBooks(external.results); return { ...external, results: imported };
}

export async function getLocalBooks(params: Record<string, string> = {}): Promise<GutendexResponse> {
  const page = Math.max(1, Number(params.page ?? 1));
  const local = await localRows({ search: params.search ?? params.title ?? params.topic, genre: params.genre, page, limit: 24, sort: params.sort });
  return { count: local.count, next: null, previous: page > 1 ? "local" : null, results: local.rows.map(rowToBook) };
}
