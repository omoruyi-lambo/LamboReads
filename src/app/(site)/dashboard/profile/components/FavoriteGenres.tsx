"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { READING_INTERESTS } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface FavoriteGenresProps {
  user: User | null;
}

export function FavoriteGenres({ user }: FavoriteGenresProps) {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('favorite_genres')
          .eq('user_id', user?.id)
          .single();

        if (userProfile?.favorite_genres) {
          setGenres(Array.isArray(userProfile.favorite_genres) ? userProfile.favorite_genres : []);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchGenres();
    }
  }, [user]);

  const handleRemoveGenre = async (genre: string) => {
    try {
      const supabase = getSupabaseClient();
      const updatedGenres = genres.filter((g) => g !== genre);
      
      await supabase
        .from('user_profiles')
        .update({ favorite_genres: updatedGenres })
        .eq('user_id', user?.id);
      
      setGenres(updatedGenres);
    } catch (error) {
      console.error("Failed to remove genre:", error);
    }
  };

  const handleAddGenre = async (genre: string) => {
    try {
      const supabase = getSupabaseClient();
      const updatedGenres = [...genres, genre];
      
      await supabase
        .from('user_profiles')
        .update({ favorite_genres: updatedGenres })
        .eq('user_id', user?.id);
      
      setGenres(updatedGenres);
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add genre:", error);
    }
  };

  const availableGenres = READING_INTERESTS.filter((genre) => !genres.includes(genre));

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Favorite Genres</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-slate-800/60 animate-pulse" />
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
        <h3 className="text-xl font-semibold text-white">Favorite Genres</h3>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Genre
        </button>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-2xl border border-white/10 bg-white/5"
          >
          <p className="text-sm text-slate-400 mb-3">Select a genre to add:</p>
          <div className="flex flex-wrap gap-2">
            {availableGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => handleAddGenre(genre)}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200"
              >
                {genre}
              </button>
            ))}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              <span className="text-sm text-slate-300">{genre}</span>
              <button
                onClick={() => handleRemoveGenre(genre)}
                className="opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <p className="text-slate-400 text-sm">No favorite genres selected yet</p>
        </div>
      )}
    </motion.div>
  );
}
