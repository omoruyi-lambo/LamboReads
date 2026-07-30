"use client";

import { motion } from "framer-motion";
import { BookOpen, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface ReadingGoalsProps {
  user: User | null;
}

interface Goal {
  type: "books_month" | "pages_week" | "hours_month";
  target: number;
  current: number;
  label: string;
  icon: any;
}

export function ReadingGoals({ user }: ReadingGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const { data: readingProgress } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user?.id)
          .gte('last_opened', startOfMonth.toISOString());

        const booksThisMonth = readingProgress?.filter((p: any) => 
          new Date(p.last_opened) >= startOfMonth && p.progress >= 100
        ).length || 0;

        const pagesThisWeek = readingProgress?.reduce((acc: number, p: any) => {
          if (new Date(p.last_opened) >= startOfWeek) {
            return acc + (p.pages_read || 0);
          }
          return acc;
        }, 0) || 0;

        const hoursThisMonth = userProfile?.monthly_hours || 0;

        setGoals([
          {
            type: "books_month",
            target: userProfile?.monthly_books_goal || 4,
            current: booksThisMonth,
            label: "Books This Month",
            icon: BookOpen,
          },
          {
            type: "pages_week",
            target: userProfile?.weekly_pages_goal || 500,
            current: pagesThisWeek,
            label: "Pages This Week",
            icon: FileText,
          },
          {
            type: "hours_month",
            target: userProfile?.monthly_hours_goal || 20,
            current: hoursThisMonth,
            label: "Hours This Month",
            icon: Clock,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchGoals();
    }
  }, [user]);

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Reading Goals</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Reading Goals</h3>
      
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = percentage >= 100;

          return (
            <motion.div
              key={goal.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isComplete ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{goal.label}</p>
                    <p className="text-xs text-slate-500">
                      {goal.current} / {goal.target}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  isComplete ? "text-emerald-400" : "text-slate-400"
                )}>
                  {Math.round(percentage)}%
                </span>
              </div>
              
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  )}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
