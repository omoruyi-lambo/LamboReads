"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BookGrid } from "@/components/books/BookGrid";
import type { GutenbergBook } from "@/lib/types";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function LibraryClient() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<GutenbergBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState("popular");
  const topic = searchParams.get("topic") ?? "";
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalBooks, setTotalBooks] = useState<number | null>(null);

  const load = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageNum) });
    if (search) params.set("search", search);
    if (sort === "popular") params.set("sort", "popular");
    if (topic) params.set("topic", topic.toLowerCase());

    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    
    setBooks((prev) => {
      const combined = append ? [...prev, ...data.results] : data.results;
      const seenIds = new Set<number>();
      const unique = combined.filter((book: GutenbergBook) => {
        if (seenIds.has(book.id)) return false;
        seenIds.add(book.id);
        return true;
      });
      return unique;
    });
    
    setHasMore(!!data.next);
    setLoading(false);
  }, [search, sort, topic]);

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  useEffect(() => {
    async function fetchTotalCount() {
      try {
        const supabase = getSupabaseClient();
        const { count } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });
        setTotalBooks(count ?? 0);
      } catch {
        setTotalBooks(null);
      }
    }
    fetchTotalCount();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-[#111827] sm:text-4xl">Free Library</h1>
            <p className="mt-2 text-[#64748B]">
              {totalBooks !== null
                ? `${totalBooks.toLocaleString()}+ free public-domain books — search, read, save, and download.`
                : "Search, read, save, and download free public-domain books."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search by title or author…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(1)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm outline-none focus:border-[#10B981]"
            >
              <option value="popular">Most Popular</option>
              <option value="ascending">Recently Added</option>
            </select>
            <Button variant="primary" onClick={() => load(1)}>
              Search
            </Button>
          </div>
        </div>

        <BookGrid books={books} loading={loading && books.length === 0} showActions />

        {hasMore && !loading && (
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => { const n = page + 1; setPage(n); load(n, true); }}>
              <ArrowDown className="h-4 w-4" /> Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
