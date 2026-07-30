import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminBookUploadForm } from "./AdminBookUploadForm";
import type { BookData } from "./AdminBookUploadForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("books").select("title").eq("id", id).single();
  return { title: data ? `Manage Files — ${data.title}` : "Manage Files — Admin" };
}

export default async function AdminBookUploadPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: book, error } = await supabase
    .from("books")
    .select(`id, title, author, status,
             cover_url, cover_path,
             book_path, book_file_name,
             sample_url, sample_path,
             audiobook_path, audiobook_file_name`)
    .eq("id", id)
    .single();

  if (error || !book) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/books" className="inline-flex items-center gap-1 hover:text-[#10B981] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Books
        </Link>
        <span>/</span>
        <span className="text-[#374151] font-medium truncate max-w-xs">{book.title}</span>
        <span>/</span>
        <span>Manage Files</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[#111827]">Manage Files</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Upload, replace, or delete files for this book. Each change saves immediately.
        </p>
      </div>

      <AdminBookUploadForm book={book as BookData} />
    </div>
  );
}
