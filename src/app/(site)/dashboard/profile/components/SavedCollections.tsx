"use client";

import { motion } from "framer-motion";
import { Folder, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface SavedCollectionsProps {
  user: User | null;
}

interface Collection {
  id: string;
  name: string;
  bookCount: number;
  createdAt: string;
}

export function SavedCollections({ user }: SavedCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const supabase = getSupabaseClient();
        
        const { data: collectionsData } = await supabase
          .from('book_collections')
          .select('*')
          .eq('user_id', user?.id);

        if (collectionsData) {
          const mappedCollections: Collection[] = collectionsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            bookCount: c.book_count || 0,
            createdAt: c.created_at,
          }));
          setCollections(mappedCollections);
        }
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchCollections();
    }
  }, [user]);


  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Saved Collections</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-800/60 animate-pulse" />
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
        <h3 className="text-xl font-semibold text-white">Saved Collections</h3>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all duration-200">
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.length > 0 ? (
          collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/dashboard/library?collection=${encodeURIComponent(collection.id)}`}>
              <div className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                    <Folder className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                
                <h4 className="text-sm font-semibold text-white mb-1">{collection.name}</h4>
                <p className="text-xs text-slate-500">{collection.bookCount} books</p>
              </div>
            </Link>
          </motion.div>
        ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400">
            No collections yet
          </div>
        )}
      </div>
    </motion.div>
  );
}
