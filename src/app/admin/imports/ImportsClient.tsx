"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faDownload, faEye, faXmark,
  faSpinner, faCheck, faRotate, faSquareCheck,
  faSquare, faLayerGroup, faTriangleExclamation,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { GutendexBook, GutendexPage } from "@/lib/gutenberg";

// ── Types ─────────────────────────────────────────────────────────────────────

type ImportStatus = "idle" | "already" | "importing" | "done" | "error";

interface BookState {
  book: GutendexBook;
  status: ImportStatus;
  selected: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function coverUrl(book: GutendexBook) {
  return book.formats["image/jpeg"] ?? book.formats["image/png"] ?? null;
}

function fmtCount(n: number) { return n.toLocaleString(); }

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ book, onClose }: { book: GutendexBook; onClose: () => void }) {
  const cover = coverUrl(book);
  const author = book.authors.map((a) => a.name).join(", ") || "Unknown Author";

  const formats = Object.entries(book.formats)
    .filter(([, url]) => url.startsWith("http"))
    .map(([mime, url]) => ({ mime, url }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-semibold text-[#111827] truncate pr-4">{book.title}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors">
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-6">
            {cover && (
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] shadow-sm">
                <Image src={cover} alt={book.title} fill className="object-cover" sizes="96px" unoptimized />
              </div>
            )}
            <div className="min-w-0 space-y-2">
              <h3 className="text-base font-bold text-[#111827] leading-snug">{book.title}</h3>
              <p className="text-sm text-[#64748B]">{author}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                  ID {book.id}
                </span>
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                  {book.languages.join(", ").toUpperCase()}
                </span>
                <span className="rounded-md bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#059669]">
                  {fmtCount(book.download_count)} downloads
                </span>
              </div>
            </div>
          </div>

          {book.subjects.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {book.subjects.slice(0, 12).map((s) => (
                  <span key={s} className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-xs text-[#475569]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {formats.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">Available formats</p>
              <div className="space-y-1.5">
                {formats.slice(0, 8).map(({ mime, url }) => (
                  <a key={mime} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                    <span className="font-mono text-[#64748B] truncate">{mime}</span>
                    <FontAwesomeIcon icon={faDownload} className="h-3 w-3 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Book card ─────────────────────────────────────────────────────────────────

function BookCard({
  state,
  onImport,
  onPreview,
  onToggleSelect,
}: {
  state: BookState;
  onImport: () => void;
  onPreview: () => void;
  onToggleSelect: () => void;
}) {
  const { book, status, selected } = state;
  const cover  = coverUrl(book);
  const author = book.authors.map((a) => a.name).join(", ") || "Unknown Author";

  return (
    <div className={cn(
      "relative flex gap-4 rounded-xl border bg-white p-4 transition-all duration-150",
      selected ? "border-[#10B981] bg-[#F0FDF4]" : "border-[#E5E7EB] hover:border-[#CBD5E1]"
    )}>
      {/* Select checkbox */}
      <button type="button" onClick={onToggleSelect}
        className="absolute left-3 top-3 text-[#94A3B8] hover:text-[#10B981] transition-colors z-10"
        aria-label={selected ? "Deselect" : "Select"}>
        <FontAwesomeIcon icon={selected ? faSquareCheck : faSquare}
          className={cn("h-4 w-4", selected && "text-[#10B981]")} />
      </button>

      {/* Cover */}
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] ml-5">
        {cover
          ? <Image src={cover} alt={book.title} fill className="object-cover" sizes="64px" unoptimized />
          : <div className="flex h-full items-center justify-center text-[#CBD5E1] text-xs font-medium">No cover</div>}
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-[#111827] line-clamp-2 leading-snug">{book.title}</p>
        <p className="text-xs text-[#64748B] truncate">{author}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="text-[10px] font-medium text-[#94A3B8]">ID {book.id}</span>
          <span className="text-[#E5E7EB]">·</span>
          <span className="text-[10px] font-medium text-[#94A3B8]">{book.languages.join(", ").toUpperCase()}</span>
          <span className="text-[#E5E7EB]">·</span>
          <span className="text-[10px] font-medium text-[#94A3B8]">{fmtCount(book.download_count)} dl</span>
        </div>
        {book.subjects.length > 0 && (
          <p className="text-[10px] text-[#94A3B8] truncate">{book.subjects.slice(0, 3).join(" · ")}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        <button type="button" onClick={onPreview}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
          aria-label="Preview">
          <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
        </button>

        {status === "already" ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0FDF4] px-2.5 py-1 text-[10px] font-semibold text-[#059669]">
            <FontAwesomeIcon icon={faCheck} className="h-2.5 w-2.5" /> Imported
          </span>
        ) : status === "done" ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0FDF4] px-2.5 py-1 text-[10px] font-semibold text-[#059669]">
            <FontAwesomeIcon icon={faCircleCheck} className="h-2.5 w-2.5" /> Done
          </span>
        ) : status === "error" ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
            <FontAwesomeIcon icon={faTriangleExclamation} className="h-2.5 w-2.5" /> Failed
          </span>
        ) : (
          <button type="button" onClick={onImport} disabled={status === "importing"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#162032] disabled:opacity-60 transition-colors">
            {status === "importing"
              ? <><FontAwesomeIcon icon={faSpinner} className="h-2.5 w-2.5 animate-spin" /> Importing…</>
              : <><FontAwesomeIcon icon={faDownload} className="h-2.5 w-2.5" /> Import</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ImportsClient({ adminId }: { adminId: string }) {
  const [query,      setQuery]      = useState("");
  const [language,   setLanguage]   = useState("en");
  const [searching,  setSearching]  = useState(false);
  const [results,    setResults]    = useState<BookState[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);
  const [nextUrl,    setNextUrl]    = useState<string | null>(null);
  const [prevUrl,    setPrevUrl]    = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<GutendexBook | null>(null);
  const [bulkStatus,  setBulkStatus]  = useState<string | null>(null);
  const [syncing,     setSyncing]     = useState(false);
  const [syncResult,  setSyncResult]  = useState<{ imported: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCount  = results.filter((r) => r.selected).length;
  const selectedIds    = results.filter((r) => r.selected && r.status === "idle").map((r) => r.book.id);

  // ── Search ──────────────────────────────────────────────────────────────────
  const search = useCallback(async (pg = 1) => {
    if (!query.trim()) return;
    setSearching(true);
    setBulkStatus(null);
    setSyncResult(null);
    try {
      const params = new URLSearchParams({ search: query.trim(), language, page: String(pg) });
      const res  = await fetch(`/api/admin/gutenberg/search?${params}`);
      const data = await res.json() as GutendexPage & { error?: string };
      if (data.error) { alert(data.error); return; }

      // Check which IDs already exist in our DB
      const ids       = data.results.map((b) => b.id);
      const checkRes  = await fetch("/api/admin/gutenberg/search/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const checked: { existing: number[] } = checkRes.ok
        ? await checkRes.json()
        : { existing: [] };
      const existingSet = new Set(checked.existing);

      setResults(data.results.map((book) => ({
        book,
        status: existingSet.has(book.id) ? "already" : "idle",
        selected: false,
      })));
      setTotalCount(data.count);
      setNextUrl(data.next);
      setPrevUrl(data.previous);
      setPage(pg);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }, [query, language]);

  // ── Import one book ─────────────────────────────────────────────────────────
  const importOne = useCallback(async (id: number) => {
    setResults((prev) =>
      prev.map((r) => r.book.id === id ? { ...r, status: "importing" } : r)
    );
    try {
      const res  = await fetch("/api/admin/gutenberg/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      setResults((prev) =>
        prev.map((r) => r.book.id === id
          ? { ...r, status: data.imported > 0 ? "done" : "error" }
          : r)
      );
    } catch {
      setResults((prev) =>
        prev.map((r) => r.book.id === id ? { ...r, status: "error" } : r)
      );
    }
  }, []);

  // ── Bulk import ─────────────────────────────────────────────────────────────
  const bulkImport = useCallback(async () => {
    if (!selectedIds.length) return;
    setBulkStatus(`Importing ${selectedIds.length} books…`);
    setResults((prev) =>
      prev.map((r) => selectedIds.includes(r.book.id) ? { ...r, status: "importing" } : r)
    );
    try {
      const res  = await fetch("/api/admin/gutenberg/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      setResults((prev) =>
        prev.map((r) => selectedIds.includes(r.book.id)
          ? { ...r, status: "done", selected: false }
          : r)
      );
      setBulkStatus(`✓ ${data.imported} imported, ${data.skipped} skipped, ${data.failed} failed`);
    } catch (err) {
      setBulkStatus(`Error: ${err instanceof Error ? err.message : "unknown"}`);
      setResults((prev) =>
        prev.map((r) => selectedIds.includes(r.book.id) ? { ...r, status: "error" } : r)
      );
    }
  }, [selectedIds]);

  // ── Sync latest ─────────────────────────────────────────────────────────────
  const syncLatest = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res  = await fetch("/api/admin/gutenberg/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, maxPages: 5 }),
      });
      const data = await res.json();
      setSyncResult({ imported: data.imported, skipped: data.skipped });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [language]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Import Books</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Search Project Gutenberg and import books into Supabase</p>
        </div>
        <button type="button" onClick={syncLatest} disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-50 transition-colors">
          <FontAwesomeIcon icon={faRotate} className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Syncing…" : "Sync Latest Books"}
        </button>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className="rounded-xl border border-[#ECFDF5] bg-[#F0FDF4] px-4 py-3 flex items-center gap-3">
          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-[#10B981] shrink-0" />
          <p className="text-sm text-[#059669] font-medium">
            {fmtCount(syncResult.imported)} new books imported — {fmtCount(syncResult.skipped)} already existed
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            placeholder="Search by title, author, or subject…"
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 transition-all"
          />
        </div>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#10B981] transition-all">
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="es">Spanish</option>
          <option value="it">Italian</option>
          <option value="">All languages</option>
        </select>
        <button type="button" onClick={() => search(1)} disabled={searching || !query.trim()}
          className="h-10 rounded-xl bg-[#0B1220] px-5 text-sm font-semibold text-white hover:bg-[#162032] disabled:opacity-50 transition-colors">
          {searching ? <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Bulk actions bar */}
      {results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setResults((prev) =>
                prev.map((r) => ({ ...r, selected: r.status === "idle" ? !prev.every((x) => x.status !== "idle" || x.selected) : r.selected }))
              )}
              className="text-xs font-medium text-[#64748B] hover:text-[#111827] transition-colors flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLayerGroup} className="h-3.5 w-3.5" />
              {selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
            </button>
            {totalCount > 0 && (
              <span className="text-xs text-[#94A3B8]">{fmtCount(totalCount)} results</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {bulkStatus && (
              <span className="text-xs text-[#64748B]">{bulkStatus}</span>
            )}
            {selectedIds.length > 0 && (
              <button type="button" onClick={bulkImport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#059669] transition-colors">
                <FontAwesomeIcon icon={faDownload} className="h-3 w-3" />
                Import {selectedIds.length} selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {searching ? (
        <div className="flex items-center justify-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-[#10B981]" />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="space-y-3">
            {results.map((state) => (
              <BookCard
                key={state.book.id}
                state={state}
                onImport={() => importOne(state.book.id)}
                onPreview={() => setPreviewBook(state.book)}
                onToggleSelect={() =>
                  setResults((prev) =>
                    prev.map((r) =>
                      r.book.id === state.book.id && r.status === "idle"
                        ? { ...r, selected: !r.selected }
                        : r
                    )
                  )
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {(prevUrl || nextUrl) && (
            <div className="flex items-center justify-between text-sm pt-2">
              <p className="text-[#94A3B8]">Page {page}</p>
              <div className="flex gap-2">
                {prevUrl && (
                  <button onClick={() => search(page - 1)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                    Previous
                  </button>
                )}
                {nextUrl && (
                  <button onClick={() => search(page + 1)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : query && !searching ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-semibold text-[#111827]">No results</p>
          <p className="text-xs text-[#94A3B8] mt-1">Try a different search term</p>
        </div>
      ) : null}

      {/* Preview modal */}
      {previewBook && (
        <PreviewModal book={previewBook} onClose={() => setPreviewBook(null)} />
      )}
    </div>
  );
}
