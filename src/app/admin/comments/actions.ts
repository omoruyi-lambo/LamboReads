"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function moderateComment(id: string, reply: boolean, status: "published" | "hidden" | "reported") { await requireAdmin(); const supabase = await createSupabaseServerClient(); const { error } = await supabase.from(reply ? "comment_replies" : "comments").update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw new Error(error.message); revalidatePath("/admin/comments"); }
export async function deleteComment(id: string, reply: boolean) { await requireAdmin(); const supabase = await createSupabaseServerClient(); const { error } = await supabase.from(reply ? "comment_replies" : "comments").delete().eq("id", id); if (error) throw new Error(error.message); revalidatePath("/admin/comments"); }
