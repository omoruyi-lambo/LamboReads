"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

export function CategoriesSection() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("categories")
          .select("name")
          .order("name");
        if (data && data.length > 0) {
          setCategories(data.map((c: any) => c.name));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-500">No categories available yet.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/library?topic=${encodeURIComponent(cat)}`}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}
