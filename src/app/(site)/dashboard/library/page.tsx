"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, BookOpen } from "lucide-react";
import { fetchPersonalization } from "@/lib/personalization";
import type { PersonalizationData } from "@/lib/personalization";
import { getAuthorName, getCoverUrl } from "@/lib/gutendex";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-3">
          <div className="aspect-[2/3] rounded-lg bg-[#F1F5F9] mb-2" />
          <div className="h-3 w-3/4 rounded bg-[#F1F5F9] mt-2" />
          <div className="h-2 w-1/2 rounded bg-[#F1F5F9] mt-1" />
        </div>
      ))}
    </div>
  );
}

export default function MyLibraryPage() {
  const [data, setData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const personalization = await fetchPersonalization();
        if (mounted) setData(personalization);
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-7 w-40 rounded bg-[#F1F5F9] animate-pulse mb-2" />
        <div className="h-4 w-48 rounded bg-[#F1F5F9] animate-pulse mb-6" />
        <SkeletonGrid />
      </div>
    );
  }

  const savedBooks = data?.savedBooks ?? [];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111827]">Saved Books</h1>
        <p className="text-sm text-[#64748B] mt-1">Books you&apos;ve saved to your library</p>
      </motion.div>

      {savedBooks.length === 0 ? (
        <motion.div variants={item} className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-12 text-center">
          <Heart className="h-12 w-12 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#64748B]">No saved books yet</p>
          <Link href="/library" className="mt-3 inline-flex text-sm text-[#10B981] hover:text-[#059669]">
            Browse Library
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={item} className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedBooks.map((s) => {
            if (!s.book) return null;
            const cover = getCoverUrl(s.book);
            return (
              <motion.div key={s.bookId} variants={item}>
                <Link href={`/book/${s.bookId}`}>
                  <div className="group rounded-xl border border-[#E5E7EB] bg-white p-3 transition-all duration-300 hover:border-[#10B981] hover:shadow-sm">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#F8FAFC]">
                      {cover ? (
                        <img src={cover} alt={s.book.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-[#94A3B8]" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Heart className="h-3 w-3 text-rose-500" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-2">
                      {s.book.title}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">{getAuthorName(s.book)}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
