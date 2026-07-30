"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { FileUpload } from "@/components/upload/FileUpload";
import { SampleUpload } from "@/components/upload/SampleUpload";
import { AudiobookUpload } from "@/components/upload/AudiobookUpload";
import { cn } from "@/lib/utils";
import { submitBook } from "./uploadActions";

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const GENRES = [
  "Gospel & Christian","Romance","Fiction","Non-Fiction","Mystery & Thriller",
  "Fantasy","Science Fiction","Adventure","Business","Entrepreneurship",
  "Self-Help","Personal Development","Technology","Programming","Education",
  "Biography","History","Health & Wellness","Finance","Philosophy",
  "Politics","Children's Books","Poetry","African Literature","Science",
];

const LANGUAGES = [
  "English","French","Spanish","Portuguese","German",
  "Arabic","Swahili","Yoruba","Igbo","Hausa",
];

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable primitives
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]",
        "placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2",
        "focus:ring-[#10B981]/20 transition-all",
        className,
      )}
      {...p}
    />
  );
}

function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827]",
        "placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2",
        "focus:ring-[#10B981]/20 transition-all resize-none",
        className,
      )}
      {...p}
    />
  );
}

function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]",
        "focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all",
        className,
      )}
      {...p}
    />
  );
}

function SectionCard({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#F1F5F9] px-5 py-3.5">
        <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
        {description && <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form state
// ─────────────────────────────────────────────────────────────────────────────

interface FileState {
  cover_url: string;
  cover_path: string;
  book_path: string;
  book_file_name: string;
  sample_url: string;
  sample_path: string;
  audiobook_path: string;
  audiobook_file_name: string;
}

interface MetaState {
  title: string;
  subtitle: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  publisher: string;
  publication_year: string;
  isbn: string;
  pages: string;
  reading_time: string;
  book_type: "free" | "premium";
  tags: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  authorName: string;
}

export function AuthorUploadForm({ authorName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  // Generate a stable UUID for this upload session. This is used as both the
  // bookId for the database row AND the folder name in all storage buckets, so
  // files land at covers/{bookId}/… even before the row is inserted.
  const [bookId] = useState(() => crypto.randomUUID());

  const [meta, setMeta] = useState<MetaState>({
    title: "", subtitle: "", author: authorName,
    description: "", genre: "", language: "English",
    publisher: "", publication_year: "", isbn: "",
    pages: "", reading_time: "",
    book_type: "free",
    tags: "", seo_title: "", seo_description: "", seo_keywords: "",
  });

  const [files, setFiles] = useState<FileState>({
    cover_url: "", cover_path: "",
    book_path: "", book_file_name: "",
    sample_url: "", sample_path: "",
    audiobook_path: "", audiobook_file_name: "",
  });

  const setM = (k: keyof MetaState, v: string) =>
    setMeta((s) => ({ ...s, [k]: v }));

  const setF = (k: keyof FileState, v: string) =>
    setFiles((s) => ({ ...s, [k]: v }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta.title.trim())  { toast.error("Title is required.");            return; }
    if (!meta.author.trim()) { toast.error("Author name is required.");      return; }
    if (!files.book_path)    { toast.error("Please upload the book file.");  return; }

    startTransition(async () => {
      const result = await submitBook({
        bookId,
        ...meta,
        publication_year: meta.publication_year ? parseInt(meta.publication_year, 10) : null,
        pages:            meta.pages            ? parseInt(meta.pages, 10)            : null,
        reading_time:     meta.reading_time     ? parseInt(meta.reading_time, 10)     : null,
        tags:             meta.tags.split(",").map((t) => t.trim()).filter(Boolean),
        ...files,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[#D1FAE5] bg-[#ECFDF5]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981] mb-5">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#111827]">Book submitted!</h2>
        <p className="mt-2 text-sm text-[#64748B] max-w-sm">
          Your book has been submitted for review. The LamboReads team will approve it shortly
          and it will appear as <strong>Published</strong> in your books.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/author/dashboard/books")}
            className="rounded-lg bg-[#0B1220] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 transition-colors"
          >
            View My Books
          </button>
          <button
            onClick={() => router.push("/author/dashboard/upload")}
            className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Row: cover + core metadata ─────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[180px_1fr]">

        {/* Cover */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-[#374151]">Cover Image</p>
          <CoverUpload
            bookId={bookId}
            initialUrl={files.cover_url || null}
            onUploaded={(url, path) => { setF("cover_url", url); setF("cover_path", path); }}
            onRemoved={() => { setF("cover_url", ""); setF("cover_path", ""); }}
          />
          <p className="text-[10px] text-[#94A3B8]">JPG · PNG · WEBP · max 5 MB</p>
        </div>

        {/* Metadata */}
        <SectionCard title="Book Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required>
              <Input
                placeholder="Book title"
                value={meta.title}
                onChange={(e) => setM("title", e.target.value)}
                required
              />
            </Field>
            <Field label="Subtitle">
              <Input
                placeholder="Optional subtitle"
                value={meta.subtitle}
                onChange={(e) => setM("subtitle", e.target.value)}
              />
            </Field>
            <Field label="Author Name" required>
              <Input
                placeholder="Your name or pen name"
                value={meta.author}
                onChange={(e) => setM("author", e.target.value)}
                required
              />
            </Field>
            <Field label="Publisher">
              <Input
                placeholder="Publisher (optional)"
                value={meta.publisher}
                onChange={(e) => setM("publisher", e.target.value)}
              />
            </Field>
            <Field label="Genre">
              <Select value={meta.genre} onChange={(e) => setM("genre", e.target.value)}>
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </Field>
            <Field label="Language">
              <Select value={meta.language} onChange={(e) => setM("language", e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Publication Year">
              <Input
                type="number" placeholder="e.g. 2024" min={1900} max={2099}
                value={meta.publication_year}
                onChange={(e) => setM("publication_year", e.target.value)}
              />
            </Field>
            <Field label="ISBN">
              <Input
                placeholder="ISBN-13"
                value={meta.isbn}
                onChange={(e) => setM("isbn", e.target.value)}
              />
            </Field>
            <Field label="Pages">
              <Input
                type="number" placeholder="Page count" min={1}
                value={meta.pages}
                onChange={(e) => setM("pages", e.target.value)}
              />
            </Field>
            <Field label="Reading Time" hint="Estimated minutes">
              <Input
                type="number" placeholder="Minutes" min={1}
                value={meta.reading_time}
                onChange={(e) => setM("reading_time", e.target.value)}
              />
            </Field>
            <Field label="Book Type">
              <Select value={meta.book_type} onChange={(e) => setM("book_type", e.target.value)}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </Select>
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <Input
                placeholder="e.g. thriller, suspense"
                value={meta.tags}
                onChange={(e) => setM("tags", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description">
              <Textarea
                rows={4}
                placeholder="Write a short description of your book…"
                value={meta.description}
                onChange={(e) => setM("description", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>
      </div>

      {/* ── Book file (required) ────────────────────────────────────────── */}
      <SectionCard
        title="Book File"
        description="Required — the main file readers will download."
      >
        <FileUpload
          bookId={bookId}
          initialPath={files.book_path || null}
          initialName={files.book_file_name || null}
          onUploaded={(path, name) => { setF("book_path", path); setF("book_file_name", name); }}
          onRemoved={() => { setF("book_path", ""); setF("book_file_name", ""); }}
        />
        <p className="mt-2 text-xs text-[#94A3B8]">
          Accepted: PDF · EPUB · MOBI · TXT · HTML · max 100 MB
        </p>
      </SectionCard>

      {/* ── Sample / preview file (optional) ───────────────────────────── */}
      <SectionCard
        title="Sample / Preview File"
        description="Optional — a free excerpt to help readers decide."
      >
        <SampleUpload
          bookId={bookId}
          initialUrl={files.sample_url || null}
          initialName={files.sample_path ? files.sample_path.split("/").pop() ?? null : null}
          onUploaded={(url, path) => { setF("sample_url", url); setF("sample_path", path); }}
          onRemoved={() => { setF("sample_url", ""); setF("sample_path", ""); }}
        />
        <p className="mt-2 text-xs text-[#94A3B8]">
          Accepted: PDF · EPUB · TXT · HTML · max 20 MB
        </p>
      </SectionCard>

      {/* ── Audiobook (optional) ────────────────────────────────────────── */}
      <SectionCard
        title="Audiobook"
        description="Optional — upload an MP3 or M4A narration."
      >
        <AudiobookUpload
          bookId={bookId}
          initialPath={files.audiobook_path || null}
          initialName={files.audiobook_file_name || null}
          onUploaded={(path, name) => { setF("audiobook_path", path); setF("audiobook_file_name", name); }}
          onRemoved={() => { setF("audiobook_path", ""); setF("audiobook_file_name", ""); }}
        />
        <p className="mt-2 text-xs text-[#94A3B8]">
          Accepted: MP3 · M4A · max 500 MB
        </p>
      </SectionCard>

      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <SectionCard title="SEO" description="Optional — improves discoverability in search engines.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO Title">
            <Input
              placeholder="Custom search engine title"
              value={meta.seo_title}
              onChange={(e) => setM("seo_title", e.target.value)}
            />
          </Field>
          <Field label="SEO Keywords" hint="Comma-separated">
            <Input
              placeholder="e.g. free ebook, thriller"
              value={meta.seo_keywords}
              onChange={(e) => setM("seo_keywords", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="SEO Description">
              <Textarea
                rows={2}
                placeholder="Meta description for search engines"
                value={meta.seo_description}
                onChange={(e) => setM("seo_description", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Notice ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Your book will be submitted with status{" "}
        <strong>Pending Review</strong>. It becomes visible to readers only
        after admin approval.
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 justify-end pb-4">
        <button
          type="button"
          onClick={() => router.push("/author/dashboard")}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#10B981] px-5 py-2 text-sm font-semibold text-white hover:bg-[#059669] disabled:opacity-60 transition-colors"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            : <><Send className="h-4 w-4" /> Submit for Review</>}
        </button>
      </div>
    </form>
  );
}
