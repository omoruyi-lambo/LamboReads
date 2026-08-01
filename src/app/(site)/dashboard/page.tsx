"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BookMarked,
  Clock,
  Flame,
  Heart,
  Settings,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/auth";
import { fetchPersonalization } from "@/lib/personalization";
import type { PersonalizationData, ReadingHistoryItem } from "@/lib/personalization";
import type { GutenbergBook } from "@/lib/types";
import { getAuthorName, getCoverUrl } from "@/lib/gutendex";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div variants={fadeInUp} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-sm", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-[#111827]">{value}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#64748B]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ContinueReadingCard({ item: readingItem }: { item: ReadingHistoryItem }) {
  const book = readingItem.book;
  if (!book) return null;
  const cover = getCoverUrl(book);
  const author = getAuthorName(book);

  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/read/${readingItem.bookId}`}>
        <div className="group grid grid-cols-[96px_1fr] gap-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition duration-300 hover:border-[#10B981] hover:shadow-md">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-[#F8FAFC]">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[#94A3B8]">
                <BookOpen className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-base font-semibold text-[#111827] line-clamp-2">{book.title}</p>
              <p className="mt-2 text-sm text-[#64748B]">{author}</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>Progress</span>
                <span className="font-semibold text-[#10B981]">{readingItem.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full bg-[#10B981] transition-all"
                  style={{ width: `${readingItem.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BookSectionCard({ book }: { book: GutenbergBook }) {
  const cover = getCoverUrl(book);
  const author = getAuthorName(book);
  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/book/${book.id}`}>
        <div className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition duration-300 hover:border-[#10B981] hover:shadow-md">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#F8FAFC] mb-4">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full items-center justify-center text-[#94A3B8]">
                <BookOpen className="h-6 w-6" />
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-[#111827] line-clamp-2">{book.title}</p>
          <p className="mt-2 text-xs text-[#64748B] truncate">{author}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-8 text-center text-[#64748B]">
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-52 rounded-full bg-[#F1F5F9]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="h-44 rounded-2xl bg-[#F1F5F9]" />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold text-[#111827]">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Reader";

  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [currentUser, personalization] = await Promise.all([getCurrentUser(), fetchPersonalization()]);
        if (!mounted) return;
        setUser(currentUser);
        setData(personalization);

        if (currentUser?.id) {
          const supabase = getSupabaseClient();
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("total_hours_read")
            .eq("user_id", currentUser.id)
            .single();

          const hours = profile?.total_hours_read || 0;
          if (mounted) {
            setTotalMinutes(Math.round(hours * 60));
          }
        }
      } catch (error) {
        console.error("Dashboard load failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const continueReading = data?.continueReading?.filter((item) => item.book) ?? [];
  const recentlyViewed = data?.recentlyViewed?.filter((item) => item.book) ?? [];
  const recommended = data?.recommended?.slice(0, 8) ?? [];
  const trending = data?.trending?.slice(0, 8) ?? [];
  const newReleases = data?.newForYou?.slice(0, 8) ?? [];
  const savedCount = data?.savedBooks?.length ?? 0;
  const completedCount = data?.continueReading?.filter((item) => item.progress >= 100).length ?? 0;

  const streak = useMemo(() => {
    const dates = [...recentlyViewed]
      .map((item) => new Date(item.lastOpened).toISOString().slice(0, 10))
      .filter(Boolean)
      .sort((a, b) => Number(new Date(b)) - Number(new Date(a)));

    let streakCount = 0;
    let previousDate: Date | null = null;

    for (const iso of dates) {
      const currentDate = new Date(iso);
      if (!previousDate) {
        streakCount += 1;
        previousDate = currentDate;
        continue;
      }
      const diffDays = Math.round((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) continue;
      if (diffDays === 1) {
        streakCount += 1;
        previousDate = currentDate;
      } else {
        break;
      }
    }

    return Math.max(streakCount, 1);
  }, [recentlyViewed]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const quickActions = [
    { title: "Continue Reading", href: "/dashboard/history", icon: Clock, color: "bg-[#10B981]" },
    { title: "Browse Books", href: "/library", icon: BookOpen, color: "bg-[#0B1220]" },
    { title: "Saved Books", href: "/dashboard/library", icon: Heart, color: "bg-rose-500" },
    { title: "Reading History", href: "/dashboard/history", icon: BookMarked, color: "bg-sky-500" },
    { title: "Account Settings", href: "/dashboard/settings", icon: Settings, color: "bg-slate-600" },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-72 rounded-2xl bg-[#F1F5F9]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-32 rounded-2xl bg-[#F1F5F9]" />
            ))}
          </div>
        </div>
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto"
    >
      <motion.section variants={fadeInUp} className="grid gap-4 sm:gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-[#10B981]">Dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#111827]">Welcome back, {displayName}</h1>
              <p className="max-w-2xl text-sm text-[#64748B] sm:text-base">
                Pick up where you left off.
              </p>
            </div>
            <div className="rounded-2xl border border-[#10B981]/20 bg-[#ECFDF5] p-4 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-[#059669]">Total reading time</p>
              <p className="mt-2 text-3xl font-semibold text-[#111827]">{formatDuration(totalMinutes)}</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard icon={Flame} label="Reading Streak" value={`${streak} days`} color="bg-orange-500" />
            <StatCard icon={BookMarked} label="Books Completed" value={completedCount} color="bg-[#10B981]" />
            <StatCard icon={Heart} label="Books Saved" value={savedCount} color="bg-rose-500" />
            <StatCard icon={Clock} label="Currently Reading" value={continueReading.length} color="bg-sky-500" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#64748B]">Featured</p>
                <h2 className="text-xl font-semibold text-[#111827]">Trending reads</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
                <TrendingUp className="h-4 w-4 text-[#10B981]" /> Trending
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {trending.slice(0, 3).map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#10B981] hover:bg-[#F8FAFC]">
                  <div className="h-16 w-12 overflow-hidden rounded-lg bg-[#F8FAFC]">
                    {getCoverUrl(book) ? (
                      <img src={getCoverUrl(book) ?? undefined} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#94A3B8]">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] line-clamp-2">{book.title}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{getAuthorName(book)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#64748B]">Quick Actions</p>
                <h2 className="text-xl font-semibold text-[#111827]">Jump ahead</h2>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href} className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#10B981] hover:bg-[#F8FAFC]">
                  <div className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm",
                    action.color
                  )}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#111827]">{action.title}</div>
                  <p className="mt-1 text-xs text-[#64748B]">Go there now.</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeInUp} className="space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <SectionHeader title="Continue Reading" href="/dashboard/history" />
          {continueReading.length > 0 ? (
            <div className="space-y-4">
              {continueReading.slice(0, 4).map((item) => (
                <ContinueReadingCard key={item.bookId} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState message="No active books in progress yet. Start exploring to find your next read." />
          )}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <SectionHeader title="Recommended For You" href="/recommendations" />
          {recommended.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((book) => (
                <BookSectionCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyState message="Start reading to get recommendations." />
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <SectionHeader title="Recently Viewed" href="/dashboard/history" />
            {recentlyViewed.length > 0 ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
                {recentlyViewed.slice(0, 6).map((item) => (
                  <Link key={item.bookId} href={`/read/${item.bookId}`} className="min-w-[210px] shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#10B981] hover:bg-[#F8FAFC]">
                    <p className="text-sm font-semibold text-[#111827] line-clamp-2">{item.book?.title}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#64748B]">{new Date(item.lastOpened).toLocaleDateString()}</p>
                    <div className="mt-4 h-2 rounded-full bg-[#F1F5F9]">
                      <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${item.progress}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState message="Your recently viewed books will appear here once you start reading." />
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <SectionHeader title="Trending Books" href="/categories" />
            {trending.length > 0 ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
                {trending.slice(0, 6).map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="min-w-[180px] shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#10B981] hover:bg-[#F8FAFC]">
                    <p className="text-sm font-semibold text-[#111827] line-clamp-2">{book.title}</p>
                    <p className="mt-2 text-xs text-[#64748B]">{getAuthorName(book)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState message="Trending titles will show here once activity grows." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <SectionHeader title="New Releases" href="/library" />
          {newReleases.length > 0 ? (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
              {newReleases.slice(0, 6).map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} className="min-w-[180px] shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#10B981] hover:bg-[#F8FAFC]">
                  <p className="text-sm font-semibold text-[#111827] line-clamp-2">{book.title}</p>
                  <p className="mt-2 text-xs text-[#64748B]">{getAuthorName(book)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="New releases will appear here as they become available." />
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
