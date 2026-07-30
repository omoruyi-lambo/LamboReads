"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, Clock, Flame, Heart, Headphones, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface AchievementsProps {
  user: User | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlockedAt: string | null;
  requirement: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_book",
    name: "First Book",
    description: "Complete your first book",
    icon: BookOpen,
    unlockedAt: null,
    requirement: "Complete 1 book",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Read 10 books",
    icon: Sparkles,
    unlockedAt: null,
    requirement: "Complete 10 books",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Read after midnight",
    icon: Clock,
    unlockedAt: null,
    requirement: "Read between 12AM-4AM",
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Read for 50 hours",
    icon: Award,
    unlockedAt: null,
    requirement: "50 hours of reading",
  },
  {
    id: "100_hours",
    name: "Century Reader",
    description: "Read for 100 hours",
    icon: Clock,
    unlockedAt: null,
    requirement: "100 hours of reading",
  },
  {
    id: "7_day_streak",
    name: "Week Warrior",
    description: "Maintain a 7-day reading streak",
    icon: Flame,
    unlockedAt: null,
    requirement: "7-day streak",
  },
  {
    id: "book_collector",
    name: "Book Collector",
    description: "Save 25 books to your library",
    icon: Heart,
    unlockedAt: null,
    requirement: "Save 25 books",
  },
  {
    id: "audiobook_lover",
    name: "Audiobook Enthusiast",
    description: "Complete 5 audiobooks",
    icon: Headphones,
    unlockedAt: null,
    requirement: "Complete 5 audiobooks",
  },
];

export function Achievements({ user }: AchievementsProps) {
  const [userAchievements, setUserAchievements] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user?.id);

        if (achievements) {
          const unlockedMap: Record<string, string> = {};
          achievements.forEach((a: any) => {
            unlockedMap[a.achievement_id] = a.unlocked_at;
          });
          setUserAchievements(unlockedMap);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchAchievements();
    }
  }, [user]);

  const unlockedCount = Object.keys(userAchievements).length;

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Achievements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/60 animate-pulse" />
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Achievements</h3>
        <span className="text-sm text-slate-400">
          {unlockedCount} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACHIEVEMENTS.map((achievement, index) => {
          const Icon = achievement.icon;
          const isUnlocked = userAchievements[achievement.id] !== undefined;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-300",
                isUnlocked
                  ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50"
                  : "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl mb-4",
                isUnlocked ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-500"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h4 className="text-sm font-semibold text-white mb-1">{achievement.name}</h4>
              <p className="text-xs text-slate-500 mb-3">{achievement.description}</p>
              
              {isUnlocked ? (
                <p className="text-xs text-emerald-400">
                  Unlocked {new Date(userAchievements[achievement.id]).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-xs text-slate-600">{achievement.requirement}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
