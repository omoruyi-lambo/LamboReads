"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Edit2, Trash2, Eye, CheckSquare, Square,
  ChevronUp, ChevronDown, Loader2, BookOpen, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteBook, bulkUpdateStatus, bulkDelete } from "./actions";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  status: string;
  book_type: string;
  cover_url: string | null;
  download_count: number;
  view_count: number;
  bookmark_count: number;
  featured: boolean;
  trending: boolean;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-[#ECFDF5] text-[#059669] border-emerald-200",
  draft:     "bg-[#F8FAFC] text-[#64748B] border-[#E5E7EB]",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  rejected:  "bg-red-50 text-red-600 border-red-200",
};

export function BooksTableClient({ books }: { books: Book[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allSelected = books.length > 0 && selected.size === books.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(books.map((b) => b.id)));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const { error } = await deleteBook(id);
      if (error) toast.error(error);
      else { toast.success("Book deleted."); setConfirmDelete(null); }
    });
  };

  const handleBulkStatus = (status: "published" | "draft") => {
    if (selected.size === 0) return;
    startTransition(async () => {
      const { error } = await bulkUpdateStatus(Array.from(selected), status);
      if (error) toast.error(error);
      else { toast.success(`${selected.size} book(s) marked as ${status}.`); setSelected(new Set()); }
    });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      const { error } = await bulkDelete(Array.from(selected));
      if (error) toast.error(error);
      else { toast.success(`${selected.size} book(s) deleted.`); setSelected(new Set()); }
    });
  };

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-[#111827]">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleBulkStatus("published")}
              disabled={isPending}
              className="rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#059669] hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatus("draft")}
              disabled={isPending}
              className="rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors"
            >
              Unpublish
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <BookOpen className="h-10 w-10 text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">No books found</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Try a different search or add a new book.
            </p>
            <Link
              href="/admin/books/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 transition-colors"
            >
              Add First Book
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleAll} className="text-[#94A3B8] hover:text-[#111827]">
                      {allSelected
                        ? <CheckSquare className="h-4 w-4" />
                        : <Square className="h-4 w-4" />}
                    </button>
                  </th>
                  {["Book", "Author", "Genre", "Type", "Status", "Downloads", "Views", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className={cn(
                      "hover:bg-[#FAFAFA] transition-colors",
                      selected.has(book.id) && "bg-[#F0FDF4]"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(book.id)} className="text-[#94A3B8] hover:text-[#111827]">
                        {selected.has(book.id)
                          ? <CheckSquare className="h-4 w-4 text-[#10B981]" />
                          : <Square className="h-4 w-4" />}
                      </button>
                    </td>

                    {/* Cover + title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9] border border-[#E5E7EB]">
                          {book.cover_url ? (
                            <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="32px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-3.5 w-3.5 text-[#94A3B8]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#111827] truncate max-w-[180px]">{book.title}</p>
                          {book.featured && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-px rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-[#64748B] max-w-[140px] truncate">{book.author}</td>
                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">{book.genre ?? "—"}</td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        book.book_type === "premium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-[#F1F5F9] text-[#64748B] border-[#E5E7EB]"
                      )}>
                        {book.book_type}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                        STATUS_STYLES[book.status] ?? STATUS_STYLES.draft
                      )}>
                        {book.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#64748B] tabular-nums">{(book.download_count ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#64748B] tabular-nums">{(book.view_count ?? 0).toLocaleString()}</td>

                    <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                      {new Date(book.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/book/${book.id}`}
                          target="_blank"
                          className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#111827] transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/books/${book.id}/edit`}
                          className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#10B981] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/books/${book.id}/upload`}
                          className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#10B981] transition-colors"
                          title="Manage files"
                        >
                          <Upload className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(book.id)}
                          className="rounded-md p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-base font-bold text-[#111827]">Delete this book?</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              This will soft-delete the book and remove its associated files from Storage. You can permanently delete it later.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
