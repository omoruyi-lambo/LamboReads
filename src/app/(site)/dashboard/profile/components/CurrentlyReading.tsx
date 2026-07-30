"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface CurrentlyReadingProps {
  user: User | null;
}

interface ReadingItem {
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  progress: number;
  lastOpened: string;
  totalPages?: number;
}

export function CurrentlyReading({ user }: CurrentlyReadingProps) {
  const [currentBook, setCurrentBook] = useState<ReadingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentBook() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: readingProgress } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user?.id)
          .lt('progress', 100)
          .order('last_opened', { ascending: false })
          .limit(1);

        if (readingProgress && readingProgress.length > 0) {
          const item = readingProgress[0];
          setCurrentBook({
            bookId: item.book_id,
            title: item.title,
            author: item.author,
            coverUrl: item.cover_url,
            progress: item.progress,
            lastOpened: item.last_opened,
            totalPages: item.total_pages,
          });
        }
      } catch (error) {
        console.error("Failed to fetch current book:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchCurrentBook();
    }
  }, [user]);

  const estimateTimeRemaining = (progress: number, totalPages?: number) => {
    if (!totalPages) return "Unknown";
    const remainingPages = totalPages * (1 - progress / 100);
    const pagesPerHour = 30;
    const hoursRemaining = remainingPages / pagesPerHour;
    if (hoursRemaining < 1) return `${Math.round(hoursRemaining * 60)} min`;
    return `${Math.round(hoursRemaining)}h ${Math.round((hoursRemaining % 1) * 60)}m`;
  };

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Currently Reading</h3>
        <div className="h-48 rounded-2xl bg-slate-800/60 animate-pulse" />
      </motion.div>
    );
  }

  if (!currentBook) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Currently Reading</h3>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <BookOpen className="h-12 w-12 text-slate-600 mb-4" />
          <p className="text-slate-400">No book currently being read</p>
          <Link href="/library" className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
            Browse Library
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Currently Reading</h3>
      
      <Link href={`/read/${currentBook.bookId}`}>
        <div className="group grid grid-cols-[120px_1fr] gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-emerald-400/30 hover:bg-white/10">
          <div className="relative h-40 w-32 overflow-hidden rounded-2xl bg-slate-900">
            {currentBook.coverUrl ? (
              <img src={currentBook.coverUrl} alt={currentBook.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white line-clamp-2">{currentBook.title}</h4>
              <p className="mt-2 text-sm text-slate-400">{currentBook.author}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-emerald-400">{currentBook.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentBook.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{estimateTimeRemaining(currentBook.progress, currentBook.totalPages)} remaining</span>
                </div>
              </div>
              
              <button className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Continue Reading <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
