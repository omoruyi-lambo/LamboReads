"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { FileUpload } from "@/components/upload/FileUpload";
import { cn } from "@/lib/utils";
import { updateBook, permanentlyDeleteBook } from "./actions";

const GENRES = [
  "Gospel & Christian","Romance","Fiction","Non-Fiction","Mystery & Thriller",
  "Fantasy","Science Fiction","Adventure","Business","Entrepreneurship",
  "Self-Help","Personal Development","Technology","Programming","Education",
  "Biography","History","Health & Wellness","Finance","Philosophy",
  "Politics","Children's Books","Poetry","African Literature","Science",
];
const LANGUAGES = ["English","French","Spanish","Portuguese","German","Arabic","Swahili","Yoruba","Igbo","Hausa"];

/* ── Shared primitives (same as AddBookForm) ─────────────────────────── */
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#374151]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}
function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all", className)} {...p} />;
}
function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all resize-none", className)} {...p} />;
}
function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all", className)} {...p} />;
}
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#F1F5F9] px-5 py-3.5">
        <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]", checked ? "bg-[#10B981]" : "bg-[#E5E7EB]")}>
      <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200", checked ? "translate-x-4" : "translate-x-0")} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export function EditBookForm({ book }: { book: any; userId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Track previous Storage URLs so we can delete them on replace
  const prevCoverUrl = useRef<string | null>(book.cover_url ?? null);
  const prevBookUrl  = useRef<string | null>(book.book_url  ?? null);

  const [form, setForm] = useState({
    title:            book.title            ?? "",
    subtitle:         book.subtitle         ?? "",
    author:           book.author           ?? "",
    description:      book.description      ?? "",
    genre:            book.genre            ?? "",
    language:         book.language         ?? "English",
    publisher:        book.publisher        ?? "",
    publication_year: book.publication_year?.toString() ?? "",
    isbn:             book.isbn             ?? "",
    pages:            book.pages?.toString() ?? "",
    reading_time:     book.reading_time?.toString() ?? "",
    cover_url:        book.cover_url        ?? "",
    book_url:         book.book_url         ?? "",
    book_file_name:   "",
    book_type:        book.book_type        ?? "free",
    status:           book.status           ?? "draft",
    featured:         book.featured         ?? false,
    trending:         book.trending         ?? false,
    tags:             (book.tags ?? []).join(", "),
    preview_pages:    book.preview_pages?.toString() ?? "",
    seo_title:        book.seo_title        ?? "",
    seo_description:  book.seo_description  ?? "",
    seo_keywords:     book.seo_keywords     ?? "",
  });

  const set = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setIsDirty(true);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.author.trim()) { toast.error("Author is required."); return; }

    startTransition(async () => {
      const payload = {
        title:            form.title.trim(),
        subtitle:         form.subtitle.trim() || null,
        author:           form.author.trim(),
        description:      form.description.trim() || null,
        genre:            form.genre || null,
        language:         form.language || "English",
        publisher:        form.publisher.trim() || null,
        publication_year: form.publication_year ? parseInt(form.publication_year, 10) : null,
        isbn:             form.isbn.trim() || null,
        pages:            form.pages ? parseInt(form.pages, 10) : null,
        reading_time:     form.reading_time ? parseInt(form.reading_time, 10) : null,
        cover_url:        form.cover_url || null,
        book_url:         form.book_url || null,
        book_type:        form.book_type,
        status:           form.status,
        featured:         form.featured,
        trending:         form.trending,
        tags:             form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        preview_pages:    form.preview_pages ? parseInt(form.preview_pages, 10) : null,
        seo_title:        form.seo_title.trim() || null,
        seo_description:  form.seo_description.trim() || null,
        seo_keywords:     form.seo_keywords.trim() || null,
      };

      const result = await updateBook(
        book.id,
        payload,
        prevCoverUrl.current,
        prevBookUrl.current
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        setIsDirty(false);
        prevCoverUrl.current = form.cover_url || null;
        prevBookUrl.current  = form.book_url  || null;
        toast.success("Book updated.");
      }
    });
  };

  const handlePermanentDelete = () => {
    startTransition(async () => {
      await permanentlyDeleteBook(book.id);
      toast.success("Book permanently deleted.");
    });
  };

  return (
    <>
      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 font-medium">You have unsaved changes.</p>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={isPending}
            className="ml-auto rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            Save now
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
          {/* Cover */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#374151]">Cover Image</p>
            <CoverUpload
              bookId={book.id}
              initialUrl={form.cover_url || null}
              onUploaded={(url) => set("cover_url", url)}
              onRemoved={() => set("cover_url", "")}
            />
          </div>

          {/* Core fields */}
          <div className="space-y-5">
            <SectionCard title="Book Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" required>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
                </Field>
                <Field label="Subtitle">
                  <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                </Field>
                <Field label="Author" required>
                  <Input value={form.author} onChange={(e) => set("author", e.target.value)} required />
                </Field>
                <Field label="Publisher">
                  <Input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} />
                </Field>
                <Field label="Genre">
                  <Select value={form.genre} onChange={(e) => set("genre", e.target.value)}>
                    <option value="">Select genre</option>
                    {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </Select>
                </Field>
                <Field label="Language">
                  <Select value={form.language} onChange={(e) => set("language", e.target.value)}>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Publication Year">
                  <Input type="number" min={1000} max={2099} value={form.publication_year} onChange={(e) => set("publication_year", e.target.value)} />
                </Field>
                <Field label="ISBN">
                  <Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} />
                </Field>
                <Field label="Page Count">
                  <Input type="number" min={1} value={form.pages} onChange={(e) => set("pages", e.target.value)} />
                </Field>
                <Field label="Reading Time" hint="Minutes">
                  <Input type="number" min={1} value={form.reading_time} onChange={(e) => set("reading_time", e.target.value)} />
                </Field>
                <Field label="Preview Pages">
                  <Input type="number" min={0} value={form.preview_pages} onChange={(e) => set("preview_pages", e.target.value)} />
                </Field>
                <Field label="Tags" hint="Comma-separated">
                  <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description">
                  <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Book file */}
        <SectionCard title="Book File">
          <FileUpload
            bookId={book.id}
            initialPath={form.book_url || null}
            initialName={form.book_file_name || null}
            onUploaded={(path, name) => { set("book_url", path); set("book_file_name", name); }}
            onRemoved={() => { set("book_url", ""); set("book_file_name", ""); }}
          />
          {form.book_url && (
            <p className="mt-2 text-xs text-[#94A3B8]">
              Current file: <a href={form.book_url} target="_blank" rel="noreferrer" className="text-[#10B981] hover:underline">View</a>
            </p>
          )}
        </SectionCard>

        {/* Publishing */}
        <SectionCard title="Publishing Settings">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Book Type">
              <Select value={form.book_type} onChange={(e) => set("book_type", e.target.value)}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" />
              <div>
                <p className="text-sm font-medium text-[#374151]">Featured</p>
                <p className="text-xs text-[#94A3B8]">Show on homepage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Toggle checked={form.trending} onChange={(v) => set("trending", v)} label="Trending" />
              <div>
                <p className="text-sm font-medium text-[#374151]">Trending</p>
                <p className="text-xs text-[#94A3B8]">Show in trending lists</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO Settings">
          <div className="space-y-4">
            <Field label="SEO Title">
              <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
            </Field>
            <Field label="SEO Description">
              <Textarea rows={3} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
            <Field label="SEO Keywords">
              <Input value={form.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* Danger zone */}
        <SectionCard title="Danger Zone">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Permanently Delete</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Removes the book and its files from Storage. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete Book
            </button>
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pb-4">
          <button
            type="button"
            onClick={() => router.push("/admin/books")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:border-[#94A3B8] transition-colors"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1220] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 disabled:opacity-60 transition-colors"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </form>

      {/* Permanent delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Permanently delete?</h3>
            </div>
            <p className="text-sm text-[#64748B]">
              This will delete <strong>"{book.title}"</strong> and remove all associated files from Supabase Storage. This action is irreversible.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
