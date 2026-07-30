"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen } from "lucide-react";
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

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="h-16 w-12 rounded-lg bg-[#F1F5F9]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-[#F1F5F9]" />
        <div className="h-3 w-1/2 rounded bg-[#F1F5F9]" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-7 w-48 rounded bg-[#F1F5F9] animate-pulse mb-2" />
        <div className="h-4 w-32 rounded bg-[#F1F5F9] animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  const items = data?.continueReading ?? [];
  const viewed = data?.recentlyViewed ?? [];
  const hasItems = items.length > 0 || viewed.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111827]">Reading History</h1>
        <p className="text-sm text-[#64748B] mt-1">Recently viewed books</p>
      </motion.div>

      {!hasItems ? (
        <motion.div variants={item} className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-12 text-center">
          <Clock className="h-12 w-12 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#64748B]">No reading history yet</p>
          <Link href="/library" className="mt-3 inline-flex text-sm text-[#10B981] hover:text-[#059669]">
            Browse books to start reading
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={item} className="mt-6 space-y-3">
          {items.map((r) => {
            if (!r.book) return null;
            const cover = getCoverUrl(r.book);
            return (
              <Link key={`continue-${r.bookId}`} href={`/read/${r.bookId}`}>
                <div className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 hover:bg-[#F8FAFC] hover:border-[#10B981] transition-all duration-200">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F8FAFC]">
                    {cover ? (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-5 w-5 text-[#94A3B8]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#111827] group-hover:text-[#10B981] transition-colors truncate">{r.book.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{getAuthorName(r.book)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-[#10B981]">{r.progress}%</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{new Date(r.lastOpened).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
          {viewed.map((r) => {
            if (!r.book) return null;
            const cover = getCoverUrl(r.book);
            return (
              <Link key={`viewed-${r.bookId}`} href={`/read/${r.bookId}`}>
                <div className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 hover:bg-[#F8FAFC] hover:border-[#10B981] transition-all duration-200">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F8FAFC]">
                    {cover ? (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-5 w-5 text-[#94A3B8]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#111827] group-hover:text-[#10B981] transition-colors truncate">{r.book.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{getAuthorName(r.book)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[#94A3B8]">Viewed</p>
                    <p className="text-[10px] text-[#94A3B8]">{new Date(r.lastOpened).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
