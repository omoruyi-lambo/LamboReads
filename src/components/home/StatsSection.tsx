"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function StatsSection() {
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = getSupabaseClient();
        
        const { count: booksCount } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });
        
        const { count: categoriesCount } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });

        const { count: authorsCount } = await supabase
          .from("authors")
          .select("*", { count: "exact", head: true });

        const { count: downloadsCount } = await supabase
          .from("downloads")
          .select("*", { count: "exact", head: true });

        setStats([
          { value: booksCount ? `${booksCount.toLocaleString()}+` : "0", label: "Free Books" },
          { value: downloadsCount ? `${downloadsCount.toLocaleString()}+` : "0", label: "Downloads" },
          { value: categoriesCount ? `${categoriesCount}+` : "0", label: "Categories" },
          { value: authorsCount ? `${authorsCount}` : "0", label: "Authors" },
        ]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="border-y border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-8 w-24 mx-auto rounded bg-slate-100" />
              <div className="h-4 w-16 mx-auto mt-2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[#E5E7EB] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-2xl font-bold text-[#10B981]">{s.value}</p>
            <p className="mt-1 text-sm text-[#64748B]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
