"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function updateAuthorStatus(
  authorId: string,
  status: "approved" | "rejected"
) {
  // Re-verify admin on every mutation
  await requireAdmin();

  if (!supabaseAdmin) throw new Error("Supabase admin client not available");

  const { error } = await supabaseAdmin
    .from("author_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", authorId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/authors");
}
