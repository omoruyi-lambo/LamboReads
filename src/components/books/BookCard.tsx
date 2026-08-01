"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faDownload } from "@fortawesome/free-solid-svg-icons";
import type { GutenbergBook } from "@/lib/types";
import { getAuthorName, getCoverUrl, mapSubjectToCategory } from "@/lib/gutendex";
import { cn } from "@/lib/utils";
import { saveBook } from "@/lib/personalization";

interface BookCardProps {
  book: GutenbergBook;
  className?: string;
  showActions?: boolean;
}

// Bookmark icon as inline SVG — no dependency on any icon library
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5 transition-all duration-150"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function BookCard({ book, className, showActions = false }: BookCardProps) {
  const cover     = getCoverUrl(book);
  const author    = getAuthorName(book);
  const category  = mapSubjectToCategory(book.subjects);
  const lang      = book.languages?.[0]?.toUpperCase() ?? null;
  const downloads = book.download_count;

  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving || saved) return;
    setSaving(true);
    try {
      await saveBook(book.id);
      setSaved(true);
    } catch {
      // silently fail — auth may not be active
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("group flex flex-col h-full", className)}>

      {/* ── Cover ──────────────────────────────────────────────────── */}
      <div className="relative mb-3">
        <Link
          href={`/book/${book.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 rounded-2xl"
          tabIndex={0}
        >
          {/* 2:3 book-cover ratio */}
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-2xl",
              "bg-gradient-to-br from-[#F1F5F9] to-[#E9EEF4]",
              "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
              "ring-1 ring-black/[0.06]",
              "transition-all duration-300 ease-out",
              "group-hover:-translate-y-2",
              "group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.14)]",
              "group-hover:ring-black/[0.10]"
            )}
            style={{ aspectRatio: "2/3" }}
          >
            {cover ? (
              <Image
                src={cover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 200px"
                unoptimized={cover.startsWith("http")}
              />
            ) : (
              /* Empty state — uses real title, no placeholder text */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <FontAwesomeIcon icon={faBookOpen} className="h-6 w-6 text-[#94A3B8]" />
                </div>
                <span className="text-[11px] font-medium leading-snug text-[#94A3B8] line-clamp-4">
                  {book.title}
                </span>
              </div>
            )}

            {/* Spine shadow — gives a physical book depth feel */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.18), transparent)" }}
            />

            {/* Bottom gradient — eases text visibility on hover overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Language badge — real data from book.languages */}
            {lang && lang !== "EN" && (
              <div className="absolute top-2 left-2 pointer-events-none">
                <span className="inline-flex items-center rounded-md bg-black/50 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-white uppercase">
                  {lang}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Save / bookmark button */}
        {showActions && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-label={saved ? "Saved to library" : "Save to library"}
            className={cn(
              "absolute right-2 top-2 z-10",
              "flex h-8 w-8 items-center justify-center rounded-full",
              "shadow-md backdrop-blur-sm",
              "transition-all duration-200 ease-out cursor-pointer",
              saved
                ? "bg-[#10B981] text-white"
                : "bg-white/90 text-[#475569] opacity-0 group-hover:opacity-100 hover:bg-white hover:text-[#10B981] hover:scale-110 active:scale-95"
            )}
          >
            <BookmarkIcon filled={saved} />
          </button>
        )}
      </div>

      {/* ── Metadata ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">

        {/* Genre badge — derived from real subjects[] */}
        {category && (
          <span className="inline-block self-start rounded-md bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#059669] leading-none mb-0.5">
            {category}
          </span>
        )}

        {/* Title */}
        <Link href={`/book/${book.id}`} className="block min-w-0">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-[#0B1220] group-hover:text-[#059669] transition-colors duration-150">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="line-clamp-1 text-[11px] font-medium text-[#64748B]">
          {author}
        </p>

        {/* Download count — real field from API */}
        {downloads > 0 && (
          <p className="flex items-center gap-1 text-[10px] text-[#94A3B8] mt-auto pt-1">
            <FontAwesomeIcon icon={faDownload} className="h-2.5 w-2.5 shrink-0" />
            {downloads.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
