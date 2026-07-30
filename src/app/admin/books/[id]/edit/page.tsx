import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { EditBookForm } from "./EditBookForm";

export const metadata = { title: "Edit Book — Admin" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;

  if (!supabaseAdmin) notFound();

  const { data: book, error } = await supabaseAdmin
    .from("books")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !book) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Edit Book</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5 truncate">
          Editing: <span className="text-[#475569] font-medium">{book.title}</span>
        </p>
      </div>
      <EditBookForm book={book} userId={user.id} />
    </div>
  );
}
