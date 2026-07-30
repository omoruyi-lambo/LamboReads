"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Loader2 } from "lucide-react";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { FileUpload } from "@/components/upload/FileUpload";
import { cn } from "@/lib/utils";
import { saveBook } from "./actions";

const GENRES = [
  "Gospel & Christian","Romance","Fiction","Non-Fiction","Mystery & Thriller",
  "Fantasy","Science Fiction","Adventure","Business","Entrepreneurship",
  "Self-Help","Personal Development","Technology","Programming","Education",
  "Biography","History","Health & Wellness","Finance","Philosophy",
  "Politics","Children's Books","Poetry","African Literature","Science",
];

const LANGUAGES = ["English","French","Spanish","Portuguese","German","Arabic","Swahili","Yoruba","Igbo","Hausa"];

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#374151]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all resize-none",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all",
        className
      )}
      {...props}
    />
  );
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]",
        checked ? "bg-[#10B981]" : "bg-[#E5E7EB]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

interface FormState {
  title: string; subtitle: string; author: string; description: string;
  genre: string; language: string; publisher: string; publication_year: string;
  isbn: string; pages: string; reading_time: string;
  book_type: "free" | "premium"; status: "draft" | "pending" | "published";
  featured: boolean; trending: boolean;
  tags: string; preview_pages: string;
  seo_title: string; seo_description: string; seo_keywords: string;
  cover_url: string; book_url: string; book_file_name: string;
}

const EMPTY: FormState = {
  title: "", subtitle: "", author: "", description: "",
  genre: "", language: "English", publisher: "", publication_year: "",
  isbn: "", pages: "", reading_time: "",
  book_type: "free", status: "draft",
  featured: false, trending: false,
  tags: "", preview_pages: "",
  seo_title: "", seo_description: "", seo_keywords: "",
  cover_url: "", book_url: "", book_file_name: "",
};

export function AddBookForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [isPending, startTransition] = useTransition();
  // Stable bookId for this upload session — used as both the DB row id and
  // the storage folder so files land in the right place before the row is inserted.
  const [bookId] = useState(() => crypto.randomUUID());

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.author.trim()) { toast.error("Author is required."); return; }

    startTransition(async () => {
      const result = await saveBook({
        ...form,
        publication_year: form.publication_year ? parseInt(form.publication_year, 10) : null,
        pages: form.pages ? parseInt(form.pages, 10) : null,
        reading_time: form.reading_time ? parseInt(form.reading_time, 10) : null,
        preview_pages: form.preview_pages ? parseInt(form.preview_pages, 10) : null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        created_by: userId ?? null,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Book saved successfully.");
        router.push("/admin/books");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        {/* Cover */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#374151]">Cover Image</p>
          <CoverUpload
            bookId={bookId}
            onUploaded={(url) => set("cover_url", url)}
            onRemoved={() => set("cover_url", "")}
          />
        </div>

        {/* Core fields */}
        <div className="space-y-5">
          <SectionCard title="Book Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <Input
                  placeholder="Enter book title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </Field>
              <Field label="Subtitle">
                <Input
                  placeholder="Optional subtitle"
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                />
              </Field>
              <Field label="Author" required>
                <Input
                  placeholder="Author name"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                  required
                />
              </Field>
              <Field label="Publisher">
                <Input
                  placeholder="Publisher name"
                  value={form.publisher}
                  onChange={(e) => set("publisher", e.target.value)}
                />
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
                <Input
                  type="number" placeholder="e.g. 2024" min={1000} max={2099}
                  value={form.publication_year}
                  onChange={(e) => set("publication_year", e.target.value)}
                />
              </Field>
              <Field label="ISBN">
                <Input
                  placeholder="ISBN-13 or ISBN-10"
                  value={form.isbn}
                  onChange={(e) => set("isbn", e.target.value)}
                />
              </Field>
              <Field label="Page Count">
                <Input
                  type="number" placeholder="Number of pages" min={1}
                  value={form.pages}
                  onChange={(e) => set("pages", e.target.value)}
                />
              </Field>
              <Field label="Reading Time" hint="Estimated minutes to read">
                <Input
                  type="number" placeholder="Minutes" min={1}
                  value={form.reading_time}
                  onChange={(e) => set("reading_time", e.target.value)}
                />
              </Field>
              <Field label="Preview Pages" hint="Free preview page count">
                <Input
                  type="number" placeholder="e.g. 20" min={0}
                  value={form.preview_pages}
                  onChange={(e) => set("preview_pages", e.target.value)}
                />
              </Field>
              <Field label="Tags" hint="Comma-separated tags">
                <Input
                  placeholder="e.g. classic, fiction, adventure"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Description">
                <Textarea
                  rows={4}
                  placeholder="Write a short description of the book…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Book file upload */}
      <SectionCard title="Book File">
        <FileUpload
          bookId={bookId}
          onUploaded={(path, name) => { set("book_url", path); set("book_file_name", name); }}
          onRemoved={() => { set("book_url", ""); set("book_file_name", ""); }}
        />
      </SectionCard>

      {/* Publishing settings */}
      <SectionCard title="Publishing Settings">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Book Type">
            <Select value={form.book_type} onChange={(e) => set("book_type", e.target.value as "free" | "premium")}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
            </Select>
          </Field>
          <Field label="Publish Date" hint="Leave empty to publish immediately">
            <Input
              type="datetime-local"
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" />
            <div>
              <p className="text-sm font-medium text-[#374151]">Featured Book</p>
              <p className="text-xs text-[#94A3B8]">Show on homepage featured section</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={form.trending} onChange={(v) => set("trending", v)} label="Trending" />
            <div>
              <p className="text-sm font-medium text-[#374151]">Trending Book</p>
              <p className="text-xs text-[#94A3B8]">Show in trending lists</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SEO */}
      <SectionCard title="SEO Settings">
        <div className="space-y-4">
          <Field label="SEO Title" hint="Defaults to book title if empty">
            <Input
              placeholder="Custom title for search engines"
              value={form.seo_title}
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </Field>
          <Field label="SEO Description">
            <Textarea
              rows={3}
              placeholder="Meta description (150–160 characters recommended)"
              value={form.seo_description}
              onChange={(e) => set("seo_description", e.target.value)}
            />
          </Field>
          <Field label="SEO Keywords" hint="Comma-separated keywords">
            <Input
              placeholder="e.g. free ebook, fiction, classic literature"
              value={form.seo_keywords}
              onChange={(e) => set("seo_keywords", e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pb-4">
        <button
          type="button"
          onClick={() => router.push("/admin/books")}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:border-red-300 hover:text-red-500 transition-colors"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1220] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-4 w-4" /> Save Book</>
          )}
        </button>
      </div>
    </form>
  );
}
