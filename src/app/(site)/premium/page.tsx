import { supabase } from "@/lib/supabase/server";
import { PremiumBooksClient } from "./PremiumBooksClient";

export const metadata = {
  title: "Premium Books — LamboReads",
  description: "Unlock exclusive premium books on LamboReads. Preview the first chapter, then unlock the full read.",
};

export default async function PremiumPage() {
  let books: any[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("premium_books")
      .select("*")
      .eq("is_active", true)
      .order("published_at", { ascending: false });

    books = data ?? [];
  }

  return <PremiumBooksClient books={books} />;
}
