"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, BookOpen } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/auth";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface BookmarkItem {
  bookId: number;
  title: string;
  author: string;
  position: number;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) {
          setBookmarks(data.map((b: { book_id: number; title: string; author: string; position: number }) => ({
            bookId: b.book_id,
            title: b.title,
            author: b.author,
            position: b.position,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-7 w-48 rounded bg-[#F1F5F9] animate-pulse mb-2" />
        <div className="h-4 w-32 rounded bg-[#F1F5F9] animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#F1F5F9] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111827]">Bookmarks</h1>
        <p className="text-sm text-[#64748B] mt-1">Saved reading positions</p>
      </motion.div>

      {bookmarks.length === 0 ? (
        <motion.div variants={item} className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-12 text-center">
          <Bookmark className="h-12 w-12 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#64748B]">No bookmarks yet</p>
          <p className="text-xs text-[#94A3B8] mt-1">Bookmark a page while reading to see it here</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="mt-6 space-y-3">
          {bookmarks.map((b) => (
            <Link key={b.bookId} href={`/read/${b.bookId}`}>
              <div className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 hover:bg-[#F8FAFC] hover:border-[#10B981] transition-all duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF5] shrink-0">
                  <Bookmark className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#111827] group-hover:text-[#10B981] transition-colors truncate">
                    {b.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">{b.author}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#94A3B8]">Position</p>
                  <p className="text-xs font-medium text-[#10B981]">{b.position}%</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
