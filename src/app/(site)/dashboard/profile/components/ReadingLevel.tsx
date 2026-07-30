"use client";

import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface ReadingLevelProps {
  user: User | null;
}

interface LevelData {
  level: number;
  levelName: string;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

const LEVEL_NAMES = [
  "Novice Reader",
  "Book Enthusiast",
  "Avid Reader",
  "Bookworm",
  "Literary Explorer",
  "Master Reader",
  "Scholar",
  "Bibliophile",
  "Literary Legend",
  "Reading Grandmaster",
];

export function ReadingLevel({ user }: ReadingLevelProps) {
  const [levelData, setLevelData] = useState<LevelData>({
    level: 1,
    levelName: "Novice Reader",
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLevelData() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        const totalXP = userProfile?.total_xp || 0;
        const level = Math.floor(totalXP / 100) + 1;
        const currentXP = totalXP % 100;
        const xpToNextLevel = 100 - currentXP;
        const levelNameIndex = Math.min(level - 1, LEVEL_NAMES.length - 1);
        const levelName = LEVEL_NAMES[levelNameIndex];

        setLevelData({
          level,
          levelName,
          currentXP,
          xpToNextLevel,
          totalXP,
        });
      } catch (error) {
        console.error("Failed to fetch level data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchLevelData();
    }
  }, [user]);

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Reading Level</h3>
        <div className="space-y-4 animate-pulse">
          <div className="h-16 rounded-2xl bg-slate-800/60" />
          <div className="h-3 rounded-full bg-slate-800/60" />
          <div className="h-12 rounded-2xl bg-slate-800/60" />
        </div>
      </motion.div>
    );
  }

  const progressPercentage = (levelData.currentXP / 100) * 100;

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Reading Level</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <Zap className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">Level {levelData.level}</p>
              <p className="text-sm text-slate-400">{levelData.levelName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-emerald-400">{levelData.totalXP}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total XP</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progress to Level {levelData.level + 1}</span>
            <span className="text-white font-medium">{levelData.currentXP} / 100 XP</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
          <p className="text-xs text-slate-500">{levelData.xpToNextLevel} XP remaining</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-slate-300">
              Keep reading to unlock <span className="text-white font-medium">{LEVEL_NAMES[Math.min(levelData.level, LEVEL_NAMES.length - 1)]}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
