"use client";

import { motion } from "framer-motion";
import { BookOpen, BookMarked, Headphones, Flame, Clock, FileText, Heart, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface ReadingStatisticsProps {
  user: User | null;
}

interface StatData {
  booksRead: number;
  booksSaved: number;
  audiobooksCompleted: number;
  readingStreak: number;
  hoursRead: number;
  pagesRead: number;
  favoriteGenre: string;
  averageDailyReadingTime: string;
  achievementsEarned: number;
}

export function ReadingStatistics({ user }: ReadingStatisticsProps) {
  const [stats, setStats] = useState<StatData>({
    booksRead: 0,
    booksSaved: 0,
    audiobooksCompleted: 0,
    readingStreak: 0,
    hoursRead: 0,
    pagesRead: 0,
    favoriteGenre: "Not set",
    averageDailyReadingTime: "0m",
    achievementsEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: readingProgress } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user?.id);

        const { data: savedBooks } = await supabase
          .from('saved_books')
          .select('*')
          .eq('user_id', user?.id);

        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        const booksRead = readingProgress?.filter((p: any) => p.progress >= 100).length || 0;
        const booksSaved = savedBooks?.length || 0;
        const audiobooksCompleted = readingProgress?.filter((p: any) => p.progress >= 100 && p.is_audiobook).length || 0;
        const readingStreak = userProfile?.reading_streak || 1;
        const hoursRead = userProfile?.total_hours_read || 0;
        const pagesRead = userProfile?.total_pages_read || 0;
        const favoriteGenre = userProfile?.favorite_genre || "Not set";
        const achievementsEarned = userProfile?.achievements_count || 0;

        const avgMinutes = hoursRead > 0 ? Math.round((hoursRead * 60) / 30) : 0;
        const averageDailyReadingTime = avgMinutes >= 60 
          ? `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m` 
          : `${avgMinutes}m`;

        setStats({
          booksRead,
          booksSaved,
          audiobooksCompleted,
          readingStreak,
          hoursRead,
          pagesRead,
          favoriteGenre,
          averageDailyReadingTime,
          achievementsEarned,
        });
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  const statCards = [
    {
      icon: BookOpen,
      label: "Books Read",
      value: stats.booksRead,
      color: "bg-emerald-500/20 text-emerald-300",
      trend: null,
    },
    {
      icon: BookMarked,
      label: "Books Saved",
      value: stats.booksSaved,
      color: "bg-blue-500/20 text-blue-300",
      trend: null,
    },
    {
      icon: Headphones,
      label: "Audiobooks Completed",
      value: stats.audiobooksCompleted,
      color: "bg-purple-500/20 text-purple-300",
      trend: null,
    },
    {
      icon: Flame,
      label: "Reading Streak",
      value: `${stats.readingStreak} days`,
      color: "bg-orange-500/20 text-orange-300",
      trend: "up",
    },
    {
      icon: Clock,
      label: "Hours Read",
      value: `${stats.hoursRead}h`,
      color: "bg-sky-500/20 text-sky-300",
      trend: null,
    },
    {
      icon: FileText,
      label: "Pages Read",
      value: stats.pagesRead.toLocaleString(),
      color: "bg-rose-500/20 text-rose-300",
      trend: null,
    },
    {
      icon: Heart,
      label: "Favorite Genre",
      value: stats.favoriteGenre,
      color: "bg-pink-500/20 text-pink-300",
      trend: null,
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: stats.achievementsEarned,
      color: "bg-amber-500/20 text-amber-300",
      trend: null,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white mb-6">Reading Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 rounded-[28px] bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Reading Statistics</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-slate-950/20", card.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {card.trend === "up" && (
                  <span className="text-xs font-medium text-emerald-400">↑ Active</span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-white">{card.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
