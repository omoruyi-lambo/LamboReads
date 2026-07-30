"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Download,
  Library,
  FileText,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookGrid } from "@/components/books/BookGrid";
import {
  getAuthorName,
  getCoverUrl,
  getFormatUrl,
  mapSubjectToCategory,
} from "@/lib/gutendex";
import {
  fetchPersonalization,
  isPersonalizationAuthRequiredError,
  removeSavedBook,
  saveBook,
  trackRecentView,
} from "@/lib/personalization";
import type { GutenbergBook, BookFormat } from "@/lib/types";
import { Reviews } from "@/components/reviews/Reviews";
import { Comments } from "@/components/comments/Comments";

export function BookDetailClient({ book, related }: { book: GutenbergBook; related: GutenbergBook[] }) {
  const [saved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const cover = getCoverUrl(book);
  const author = getAuthorName(book);
  const category = mapSubjectToCategory(book.subjects);

  useEffect(() => {
    async function loadSavedStatus() {
      try {
        const data = await fetchPersonalization();
        setSaved(data.savedBooks.some((savedBook) => savedBook.bookId === book.id));
      } catch (err) {
        console.error("Error loading saved status:", err);
      }
    }
    loadSavedStatus();

    async function trackView() {
      try {
        await trackRecentView(book.id);
      } catch (err) {
        if (isPersonalizationAuthRequiredError(err)) return;
        console.error("Error tracking view:", err);
      }
    }
    trackView();
  }, [book.id]);

  const saveToLibrary = async () => {
    setLoadingSave(true);
    setSaveError(null);
    try {
      if (saved) {
        await removeSavedBook(book.id);
        setSaved(false);
      } else {
        await saveBook(book.id);
        setSaved(true);
      }
    } catch (err) {
      console.error("Error saving book:", err);
      setSaveError(err instanceof Error ? err.message : "Unable to update saved books.");
    } finally {
      setLoadingSave(false);
    }
  };

  const download = (format: BookFormat) => {
    const url = getFormatUrl(book, format);
    if (!url) return;
    window.open(url, "_blank");
  };

  const formats: { key: BookFormat; label: string }[] = [
    { key: "epub", label: "EPUB" },
    { key: "pdf", label: "PDF" },
    { key: "txt", label: "TXT" },
  ];

  const description = book.subjects.slice(0, 3).join(" · ");

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div className="mx-auto w-full max-w-[320px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
              {cover ? (
                <Image src={cover} alt={book.title} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
                  <BookOpen className="h-16 w-16 text-slate-300" />
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#10B981]">{category}</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">{book.title}</h1>
            <p className="mt-3 text-lg text-[#6B7280]">by {author}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {book.languages.join(", ").toUpperCase()}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                {book.download_count.toLocaleString()} downloads
              </span>
            </div>
            
            {description && (
              <p className="mt-6 max-w-xl text-base leading-7 text-[#6B7280]">
                {description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/read/${book.id}`}>
                <Button variant="primary" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" /> Read Now
                </Button>
              </Link>
              <Button variant={saved ? "secondary" : "outline"} size="lg" onClick={saveToLibrary} disabled={loadingSave}>
                <Library className="mr-2 h-5 w-5" />
                {loadingSave ? "Saving..." : saved ? "Saved" : "Save to Library"}
              </Button>
            </div>
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#F8FAFC] border-y border-[#E5E7EB]">
        <div id="download" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] font-display">Download Formats</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Download directly to your device — no external redirects required.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formats.map((f) => {
              const url = getFormatUrl(book, f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  disabled={!url}
                  onClick={() => download(f.key)}
                  className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#10B981]/50 disabled:opacity-50 disabled:hover:border-[#E5E7EB]"
                >
                  <FileText className="h-8 w-8 text-[#10B981]" />
                  <div>
                    <p className="font-semibold text-[#111827]">{f.label}</p>
                    <p className="text-xs text-[#6B7280]">{url ? "Available" : "Unavailable"}</p>
                  </div>
                  <Download className="ml-auto h-5 w-5 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] font-display">Related Books</h2>
          <div className="mt-6">
            <BookGrid books={related} />
          </div>
        </section>
      )}
      <Reviews bookId={book.id} />
      <Comments bookId={book.id} />
    </div>
  );
}
