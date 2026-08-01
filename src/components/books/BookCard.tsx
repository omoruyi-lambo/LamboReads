"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { GutenbergBook } from "@/lib/types";
import { getAuthorName, getCoverUrl } from "@/lib/gutendex";
import { cn } from "@/lib/utils";
import { saveBook } from "@/lib/personalization";

interface BookCardProps {
  book: GutenbergBook;
  className?: string;
  showActions?: boolean;
}

export function BookCard({ book, className, showActions = false }: BookCardProps) {
  const cover = getCoverUrl(book);
  const author = getAuthorName(book);
  const [saved, setSaved] = useState(false);
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
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("group flex flex-col h-full", className)}>
      {/* Cover */}
      <div className="relative mb-3">
        <Link
          href={`/book/${book.id}`}
          className="block relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 rounded-xl"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#F1F5F9] shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-black/10">
            {cover ? (
              <Image
                src={cover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, 220px"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
                <BookOpen className="h-8 w-8 text-[#CBD5E1]" />
                <span className="text-xs font-medium text-[#94A3B8] line-clamp-3 leading-snug">{book.title}</span>
              </div>
            )}
            {/* Book spine */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-black/15 via-black/8 to-black/15 pointer-events-none" />
            {/* Hover shimmer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Link>

        {/* Save button */}
        {showActions && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-label={saved ? "Saved to library" : "Save to library"}
            className={cn(
              "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm shadow-md transition-all duration-200 cursor-pointer",
              saved
                ? "bg-[#10B981] text-white scale-110"
                : "bg-white/90 text-[#64748B] hover:bg-white hover:text-[#10B981] hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={cn("h-3.5 w-3.5 transition-all duration-200", saved ? "fill-white" : "fill-none stroke-current")}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col flex-1 min-w-0">
        <Link href={`/book/${book.id}`} className="block min-w-0">
          <h3 className="line-clamp-2 text-[13px] font-semibold text-[#0B1220] leading-snug tracking-tight group-hover:text-[#10B981] transition-colors duration-150">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-[11px] text-[#94A3B8] font-medium">
          {author}
        </p>
      </div>
    </div>
  );
}
