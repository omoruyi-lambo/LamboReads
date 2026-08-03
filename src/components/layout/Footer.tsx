import { supabaseAdmin } from "@/lib/supabase/server";
import { FooterClient } from "./FooterClient";

export async function Footer() {
  let bookCount = 0;

  if (supabaseAdmin) {
    const { count } = await supabaseAdmin
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null);
    bookCount = count ?? 0;
  }

  return <FooterClient bookCount={bookCount} />;
}
