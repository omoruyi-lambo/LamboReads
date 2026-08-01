/**
 * scripts/import-books.ts
 *
 * Permanently imports public-domain books from Gutendex (Project Gutenberg)
 * into Supabase. Run with:
 *
 *   npx tsx scripts/import-books.ts
 *
 * Options (environment variables):
 *   START_PAGE=1          — resume from a specific Gutendex page
 *   MAX_PAGES=0           — 0 = import everything; N = stop after N pages
 *   BATCH_SIZE=50         — rows per Supabase upsert
 *   UPLOAD_FILES=true     — download and upload cover images + book files
 *   GUTENDEX_LANG=en      — filter by language (empty = all languages)
 *   DRY_RUN=false         — if true, fetch + parse but don't write to Supabase
 */

import * as fs from "fs";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";

// Load .env.local first (Next.js convention), then .env as fallback
for (const file of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    dotenvConfig({ path: envPath });
    break;
  }
}
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────────────────────

const GUTENDEX_BASE  = "https://gutendex.com/books";
const TIMEOUT_MS     = 15_000;
const START_PAGE     = Number(process.env.START_PAGE  ?? 1);
const MAX_PAGES      = Number(process.env.MAX_PAGES   ?? 0);  // 0 = unlimited
const BATCH_SIZE     = Number(process.env.BATCH_SIZE  ?? 50);
const UPLOAD_FILES   = process.env.UPLOAD_FILES !== "false";  // default true
const LANG_FILTER    = process.env.GUTENDEX_LANG ?? "";       // e.g. "en"
const DRY_RUN        = process.env.DRY_RUN === "true";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// ─── Supabase client (service role — bypasses RLS) ───────────────────────────

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

interface GutendexBook {
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

interface GutendexPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function pickFormat(formats: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    if (formats[k]) return formats[k];
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fmt(n: number): string {
  return n.toLocaleString();
}

// ─── Fetch with retry ─────────────────────────────────────────────────────────

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 1; i <= retries; i++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "User-Agent": "LamboReads-Importer/1.0 (https://lamboreads.com)" },
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (i < retries) {
        const wait = 2 ** i * 1000;
        console.warn(`  ⚠  fetch attempt ${i} failed (${msg}), retrying in ${wait / 1000}s…`);
        await sleep(wait);
      } else {
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("unreachable");
}

// ─── Upload binary to Supabase Storage ───────────────────────────────────────

async function uploadToStorage(
  bucket: string,
  path: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  if (DRY_RUN) return `[dry-run] ${bucket}/${path}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, { contentType, upsert: true });
  if (error) {
    console.warn(`    ⚠  storage upload failed ${bucket}/${path}: ${error.message}`);
    return null;
  }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Download remote file ─────────────────────────────────────────────────────

async function downloadFile(url: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const data = await res.arrayBuffer();
    return { data, contentType };
  } catch {
    return null;
  }
}

// ─── Check which external_ids already exist in Supabase ──────────────────────

async function fetchExistingIds(ids: string[]): Promise<Set<string>> {
  if (DRY_RUN) return new Set();
  const { data, error } = await supabase
    .from("books")
    .select("external_id")
    .in("external_id", ids);
  if (error) {
    console.warn(`  ⚠  could not check existing IDs: ${error.message}`);
    return new Set();
  }
  return new Set((data ?? []).map((r: { external_id: string }) => r.external_id));
}

// ─── Build a book row from a Gutendex result ──────────────────────────────────

async function buildRow(book: GutendexBook): Promise<Record<string, unknown>> {
  const author   = book.authors.map((a) => a.name).join(", ") || "Unknown Author";
  const genre    = book.subjects[0] ?? null;
  const language = book.languages[0] ?? "en";

  // Cover image
  const coverSrc = pickFormat(book.formats, ["image/jpeg", "image/png", "image/gif"]);
  let cover_url: string | null  = coverSrc;
  let cover_path: string | null = null;

  if (UPLOAD_FILES && coverSrc) {
    const ext  = coverSrc.includes(".png") ? "png" : "jpg";
    const path = `provider/${book.id}/cover.${ext}`;
    const file = await downloadFile(coverSrc);
    if (file) {
      const uploaded = await uploadToStorage("book-covers", path, file.data, file.contentType);
      if (uploaded) { cover_url = uploaded; cover_path = path; }
    }
  }

  // Book text file (prefer HTML for richer reading experience, fall back to TXT)
  const textSrc = pickFormat(book.formats, [
    "text/html; charset=utf-8",
    "text/html",
    "text/plain; charset=utf-8",
    "text/plain",
  ]);
  let book_url: string | null   = textSrc;
  let book_path: string | null  = null;

  if (UPLOAD_FILES && textSrc) {
    const isHtml = textSrc.includes("htm");
    const ext    = isHtml ? "html" : "txt";
    const path   = `provider/${book.id}/book.${ext}`;
    const file   = await downloadFile(textSrc);
    if (file) {
      const ct       = isHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8";
      const uploaded = await uploadToStorage("books", path, file.data, ct);
      if (uploaded) { book_url = uploaded; book_path = path; }
    }
  }

  // EPUB (store URL only — don't upload large files by default)
  const epub_url = pickFormat(book.formats, [
    "application/epub+zip",
    "application/x-mobipocket-ebook",
  ]);
  const pdf_url  = pickFormat(book.formats, ["application/pdf"]);

  const now = new Date().toISOString();

  return {
    external_id:       String(book.id),
    normalized_title:  normalize(book.title),
    normalized_author: normalize(author),
    title:             book.title,
    author,
    description:       book.subjects.slice(0, 8).join(" · ") || null,
    genre,
    language,
    cover_url,
    cover_path,
    book_url:          book_url ?? epub_url ?? pdf_url ?? null,
    book_path,
    book_file_name:    null,
    pages:             null,
    reading_time:      null,
    book_type:         "free",
    status:            "published",
    downloads:         book.download_count,
    views:             0,
    copyright:         book.copyright ?? false,
    subjects:          book.subjects,
    languages:         book.languages,
    epub_url:          epub_url ?? null,
    pdf_url:           pdf_url  ?? null,
    created_at:        now,
    updated_at:        now,
  };
}

// ─── Upsert a batch of rows into Supabase ─────────────────────────────────────

async function upsertBatch(rows: Record<string, unknown>[]): Promise<number> {
  if (DRY_RUN) {
    console.log(`  [dry-run] would upsert ${rows.length} rows`);
    return rows.length;
  }

  // Only include columns the books table actually has — unknown columns will
  // cause Supabase to reject the whole batch.
  const safe = rows.map((r) => {
    const row: Record<string, unknown> = {
      external_id:       r.external_id,
      normalized_title:  r.normalized_title,
      normalized_author: r.normalized_author,
      title:             r.title,
      author:            r.author,
      description:       r.description,
      genre:             r.genre,
      language:          r.language,
      cover_url:         r.cover_url,
      cover_path:        r.cover_path,
      book_url:          r.book_url,
      book_path:         r.book_path,
      book_file_name:    r.book_file_name,
      pages:             r.pages,
      reading_time:      r.reading_time,
      book_type:         r.book_type,
      status:            r.status,
      downloads:         r.downloads,
      views:             r.views,
      created_at:        r.created_at,
      updated_at:        r.updated_at,
    };
    return row;
  });

  const { error } = await supabase
    .from("books")
    .upsert(safe, { onConflict: "external_id", ignoreDuplicates: false });

  if (error) {
    console.error(`  ❌  upsert failed: ${error.message}`);
    return 0;
  }
  return safe.length;
}

// ─── Fetch one Gutendex page ──────────────────────────────────────────────────

async function fetchPage(url: string): Promise<GutendexPage | null> {
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.warn(`  ⚠  Gutendex responded ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as GutendexPage;
  } catch (err) {
    console.error(`  ❌  fetch failed: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" LamboReads — Gutendex Book Importer");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Start page  : ${START_PAGE}`);
  console.log(`  Max pages   : ${MAX_PAGES === 0 ? "unlimited" : MAX_PAGES}`);
  console.log(`  Batch size  : ${BATCH_SIZE}`);
  console.log(`  Upload files: ${UPLOAD_FILES}`);
  console.log(`  Lang filter : ${LANG_FILTER || "(all languages)"}`);
  console.log(`  Dry run     : ${DRY_RUN}`);
  console.log("───────────────────────────────────────────────────\n");

  let totalImported = 0;
  let totalSkipped  = 0;
  let totalFailed   = 0;
  let pageNum       = START_PAGE;

  // Build the first URL
  const firstUrl = new URL(GUTENDEX_BASE);
  firstUrl.searchParams.set("page", String(START_PAGE));
  if (LANG_FILTER) firstUrl.searchParams.set("languages", LANG_FILTER);
  let nextUrl: string | null = firstUrl.toString();

  const startTime = Date.now();

  while (nextUrl) {
    if (MAX_PAGES > 0 && pageNum > START_PAGE + MAX_PAGES - 1) {
      console.log(`\nReached MAX_PAGES (${MAX_PAGES}). Stopping.`);
      break;
    }

    console.log(`\n📄 Page ${fmt(pageNum)}  —  ${nextUrl}`);

    const page = await fetchPage(nextUrl);
    if (!page) {
      console.error("  ❌  Could not fetch page. Stopping.");
      break;
    }

    console.log(`  Total books in Gutendex: ${fmt(page.count)}  |  Results on this page: ${page.results.length}`);

    // Apply language filter client-side too (in case the param wasn't honoured)
    const books = LANG_FILTER
      ? page.results.filter((b) => b.languages.includes(LANG_FILTER))
      : page.results;

    if (books.length === 0) {
      console.log("  ⏭  No books to import on this page.");
      nextUrl = page.next ?? null;
      pageNum++;
      continue;
    }

    // Check which ones are already in Supabase
    const ids        = books.map((b) => String(b.id));
    const existingIds = await fetchExistingIds(ids);
    const newBooks   = books.filter((b) => !existingIds.has(String(b.id)));
    const skipped    = books.length - newBooks.length;
    totalSkipped    += skipped;

    if (skipped > 0) {
      console.log(`  ⏭  Skipping ${skipped} already-imported books.`);
    }

    if (newBooks.length === 0) {
      console.log("  ✓  All books on this page already imported.");
      nextUrl = page.next ?? null;
      pageNum++;
      continue;
    }

    // Process in batches
    for (let i = 0; i < newBooks.length; i += BATCH_SIZE) {
      const batch   = newBooks.slice(i, i + BATCH_SIZE);
      const batchNo = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`  📦  Building batch ${batchNo} (${batch.length} books)…`);

      const rows: Record<string, unknown>[] = [];
      for (const book of batch) {
        try {
          const row = await buildRow(book);
          rows.push(row);
          process.stdout.write(".");
        } catch (err) {
          totalFailed++;
          console.warn(`\n    ⚠  buildRow failed for book ${book.id}: ${err instanceof Error ? err.message : err}`);
        }
      }
      process.stdout.write("\n");

      if (rows.length > 0) {
        const upserted = await upsertBatch(rows);
        totalImported += upserted;
        console.log(`  ✅  Upserted ${upserted} rows.`);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n  ─── Progress: imported=${fmt(totalImported)} skipped=${fmt(totalSkipped)} failed=${fmt(totalFailed)} elapsed=${elapsed}s`);

    nextUrl = page.next ?? null;
    pageNum++;

    // Be polite to Gutendex — 500ms between pages
    if (nextUrl) await sleep(500);
  }

  // ── Final report ──────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════");
  console.log(" Import complete");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Imported : ${fmt(totalImported)}`);
  console.log(`  Skipped  : ${fmt(totalSkipped)}  (already in Supabase)`);
  console.log(`  Failed   : ${fmt(totalFailed)}`);
  console.log(`  Time     : ${elapsed}s`);
  console.log("═══════════════════════════════════════════════════\n");

  if (totalFailed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌  Importer crashed:", err);
  process.exit(1);
});
