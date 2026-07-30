"use client";

import { motion } from "framer-motion";
import { BookOpen, Bookmark, Heart, Headphones, Tag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface RecentActivityProps {
  user: User | null;
}

interface Activity {
  id: string;
  type: "started_reading" | "finished_book" | "saved_book" | "completed_audiobook" | "genre_updated";
  bookTitle: string;
  bookAuthor: string;
  bookCover: string | null;
  bookId: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function RecentActivity({ user }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: activityData } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityData) {
          const mappedActivities: Activity[] = activityData.map((item: any) => ({
            id: item.id,
            type: item.activity_type,
            bookTitle: item.book_title,
            bookAuthor: item.book_author,
            bookCover: item.book_cover,
            bookId: item.book_id,
            timestamp: item.created_at,
            metadata: item.metadata,
          }));
          setActivities(mappedActivities);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchActivities();
    }
  }, [user]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "started_reading":
        return BookOpen;
      case "finished_book":
        return Bookmark;
      case "saved_book":
        return Heart;
      case "completed_audiobook":
        return Headphones;
      case "genre_updated":
        return Tag;
      default:
        return BookOpen;
    }
  };

  const getActivityText = (type: Activity["type"], bookTitle: string) => {
    switch (type) {
      case "started_reading":
        return `Started reading ${bookTitle}`;
      case "finished_book":
        return `Finished ${bookTitle}`;
      case "saved_book":
        return `Saved ${bookTitle}`;
      case "completed_audiobook":
        return `Completed audiobook: ${bookTitle}`;
      case "genre_updated":
        return `Updated favorite genre`;
      default:
        return `Activity with ${bookTitle}`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-slate-400">No recent activity</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white line-clamp-1">{getActivityText(activity.type, activity.bookTitle)}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
                
                {activity.bookCover && (
                  <Link href={`/book/${activity.bookId}`}>
                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                      <img src={activity.bookCover} alt={activity.bookTitle} className="h-full w-full object-cover" />
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
