import { supabase } from "@/lib/supabase/server";
import { AuthorDashboardClient } from "./AuthorDashboardClient";

export const metadata = {
  title: "Author Dashboard — LamboReads",
};

export default async function AuthorDashboardPage() {
  // Fetch all dashboard data server-side from Supabase
  const stats = {
    totalBooks: 0,
    publishedBooks: 0,
    draftBooks: 0,
    totalReaders: 0,
    totalSales: 0,
    royalties: 0,
  };

  let recentBooks: Record<string, unknown>[] = [];

  if (supabase) {
    // These queries will return empty if the tables have no data yet — fully graceful
    const [booksResult] = await Promise.all([
      supabase
        .from("author_books")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    recentBooks = booksResult.data ?? [];
  }

  return <AuthorDashboardClient stats={stats} recentBooks={recentBooks} />;
}
