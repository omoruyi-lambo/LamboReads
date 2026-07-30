"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BookOpen, Heart } from "lucide-react";
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
      <div className="relative mb-3">
        <Link href={`/book/${book.id}`} className="block relative focus:outline-none">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] shadow-xs transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md">
            {cover ? (
              <Image
                src={cover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 220px"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center bg-[#F8FAFC] text-[#64748B]">
                <BookOpen className="h-8 w-8 text-[#94A3B8]" />
                <span className="text-xs font-semibold text-[#334155] line-clamp-3 leading-snug">{book.title}</span>
              </div>
            )}
            
            {/* Subtle spine border highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 pointer-events-none" />
          </div>
        </Link>

        {showActions && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            aria-label={saved ? "Book saved to library" : "Save book to library"}
            className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 backdrop-blur-md p-2 text-[#475569] shadow-sm transition-all duration-200 hover:bg-white hover:text-[#10B981] hover:scale-110 active:scale-95 disabled:opacity-80 cursor-pointer"
          >
            <Heart className={cn("h-3.5 w-3.5 transition-colors", saved && "fill-[#10B981] text-[#10B981]")} />
          </button>
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <Link href={`/book/${book.id}`} className="group-hover:text-[#10B981] transition-colors">
          <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-[#0B1220] leading-snug">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-[#64748B] font-medium">
          {author}
        </p>
      </div>
    </div>
  );
}

