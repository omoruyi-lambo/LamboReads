"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { CoverUpload } from "@/components/upload/CoverUpload";
import { FileUpload } from "@/components/upload/FileUpload";
import { SampleUpload } from "@/components/upload/SampleUpload";
import { AudiobookUpload } from "@/components/upload/AudiobookUpload";
import {
  updateBookCover,
  updateBookFile,
  updateBookSample,
  updateBookAudiobook,
  deleteBookFile,
} from "@/app/(site)/author/dashboard/upload/uploadActions";

export interface BookData {
  id: string;
  title: string;
  author: string;
  status: string;
  cover_url: string | null;
  cover_path: string | null;
  book_path: string | null;
  book_file_name: string | null;
  sample_url: string | null;
  sample_path: string | null;
  audiobook_path: string | null;
  audiobook_file_name: string | null;
}

function SectionCard({ title, description, saving, saved, children }: {
  title: string; description?: string; saving?: boolean; saved?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
          {description && <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>}
        </div>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-[#10B981]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
          </span>
        )}
        {!saving && saved && (
          <span className="flex items-center gap-1.5 text-xs text-[#10B981]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function AdminBookUploadForm({ book }: { book: BookData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [coverUrl,  setCoverUrl]  = useState(book.cover_url);
  const [coverPath, setCoverPath] = useState(book.cover_path);
  const [bookPath,  setBookPath]  = useState(book.book_path);
  const [bookName,  setBookName]  = useState(book.book_file_name);
  const [sampleUrl,  setSampleUrl]  = useState(book.sample_url);
  const [samplePath, setSamplePath] = useState(book.sample_path);
  const [audioPath, setAudioPath] = useState(book.audiobook_path);
  const [audioName, setAudioName] = useState(book.audiobook_file_name);

  const [coverSaving,  setCoverSaving]  = useState(false);
  const [coverSaved,   setCoverSaved]   = useState(false);
  const [bookSaving,   setBookSaving]   = useState(false);
  const [bookSaved,    setBookSaved]    = useState(false);
  const [sampleSaving, setSampleSaving] = useState(false);
  const [sampleSaved,  setSampleSaved]  = useState(false);
  const [audioSaving,  setAudioSaving]  = useState(false);
  const [audioSaved,   setAudioSaved]   = useState(false);

  const onCoverUploaded = (url: string, path: string) => {
    setCoverSaving(true); setCoverSaved(false);
    startTransition(async () => {
      const res = await updateBookCover({ bookId: book.id, coverUrl: url, coverPath: path, previousPath: coverPath });
      setCoverSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setCoverUrl(url); setCoverPath(path); setCoverSaved(true);
      toast.success("Cover image saved.");
    });
  };

  const onCoverRemoved = () => {
    if (!coverPath) return;
    setCoverSaving(true); setCoverSaved(false);
    startTransition(async () => {
      const res = await deleteBookFile({ bookId: book.id, bucket: "book-covers", storagePath: coverPath, clearColumns: ["cover_url", "cover_path"] });
      setCoverSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setCoverUrl(null); setCoverPath(null);
      toast.success("Cover removed.");
    });
  };

  const onBookUploaded = (path: string, name: string) => {
    setBookSaving(true); setBookSaved(false);
    startTransition(async () => {
      const res = await updateBookFile({ bookId: book.id, bookPath: path, bookFileName: name, previousPath: bookPath });
      setBookSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setBookPath(path); setBookName(name); setBookSaved(true);
      toast.success("Book file saved.");
    });
  };

  const onBookRemoved = () => {
    if (!bookPath) return;
    setBookSaving(true); setBookSaved(false);
    startTransition(async () => {
      const res = await deleteBookFile({ bookId: book.id, bucket: "books", storagePath: bookPath, clearColumns: ["book_path", "book_file_name"] });
      setBookSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setBookPath(null); setBookName(null);
      toast.success("Book file removed.");
    });
  };

  const onSampleUploaded = (url: string, path: string) => {
    setSampleSaving(true); setSampleSaved(false);
    startTransition(async () => {
      const res = await updateBookSample({ bookId: book.id, sampleUrl: url, samplePath: path, previousPath: samplePath });
      setSampleSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setSampleUrl(url); setSamplePath(path); setSampleSaved(true);
      toast.success("Sample file saved.");
    });
  };

  const onSampleRemoved = () => {
    if (!samplePath) return;
    setSampleSaving(true); setSampleSaved(false);
    startTransition(async () => {
      const res = await deleteBookFile({ bookId: book.id, bucket: "samples", storagePath: samplePath, clearColumns: ["sample_url", "sample_path"] });
      setSampleSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setSampleUrl(null); setSamplePath(null);
      toast.success("Sample removed.");
    });
  };

  const onAudioUploaded = (path: string, name: string) => {
    setAudioSaving(true); setAudioSaved(false);
    startTransition(async () => {
      const res = await updateBookAudiobook({ bookId: book.id, audiobookPath: path, audiobookFileName: name, previousPath: audioPath });
      setAudioSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setAudioPath(path); setAudioName(name); setAudioSaved(true);
      toast.success("Audiobook saved.");
    });
  };

  const onAudioRemoved = () => {
    if (!audioPath) return;
    setAudioSaving(true); setAudioSaved(false);
    startTransition(async () => {
      const res = await deleteBookFile({ bookId: book.id, bucket: "audiobooks", storagePath: audioPath, clearColumns: ["audiobook_path", "audiobook_file_name"] });
      setAudioSaving(false);
      if (res.error) { toast.error(res.error); return; }
      setAudioPath(null); setAudioName(null);
      toast.success("Audiobook removed.");
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-semibold mb-0.5">Editing files for</p>
          <h2 className="text-base font-bold text-[#111827] truncate">{book.title}</h2>
          <p className="text-sm text-[#64748B]">{book.author}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          book.status === "published" ? "bg-[#D1FAE5] text-[#059669]"
          : book.status === "pending" ? "bg-amber-100 text-amber-700"
          : "bg-[#F1F5F9] text-[#64748B]"
        }`}>
          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
        </span>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Each file saves automatically when the upload completes. Replacing a file deletes the old one from storage.</p>
      </div>

      <SectionCard title="Cover Image" description="Public — shown in search results and book pages." saving={coverSaving} saved={coverSaved}>
        <div className="flex gap-6 items-start">
          <CoverUpload bookId={book.id} initialUrl={coverUrl} onUploaded={onCoverUploaded} onRemoved={onCoverRemoved} />
          <div className="text-xs text-[#94A3B8] space-y-1 pt-2">
            <p>JPG · PNG · WEBP · max 5 MB</p>
            {coverPath && <p className="break-all text-[#CBD5E1] font-mono mt-2">{coverPath}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Book File" description="Private — served via signed URL on download." saving={bookSaving} saved={bookSaved}>
        <FileUpload bookId={book.id} initialPath={bookPath} initialName={bookName} onUploaded={onBookUploaded} onRemoved={onBookRemoved} />
        <p className="mt-2 text-xs text-[#94A3B8]">PDF · EPUB · MOBI · TXT · HTML · max 100 MB</p>
        {bookPath && <p className="mt-1 break-all text-[10px] text-[#CBD5E1] font-mono">{bookPath}</p>}
      </SectionCard>

      <SectionCard title="Sample / Preview File" description="Public — a free excerpt available before purchase." saving={sampleSaving} saved={sampleSaved}>
        <SampleUpload bookId={book.id} initialUrl={sampleUrl} initialName={samplePath ? samplePath.split("/").pop() ?? null : null} onUploaded={onSampleUploaded} onRemoved={onSampleRemoved} />
        <p className="mt-2 text-xs text-[#94A3B8]">PDF · EPUB · TXT · HTML · max 20 MB</p>
        {samplePath && <p className="mt-1 break-all text-[10px] text-[#CBD5E1] font-mono">{samplePath}</p>}
      </SectionCard>

      <SectionCard title="Audiobook" description="Private — MP3 or M4A, served via signed URL." saving={audioSaving} saved={audioSaved}>
        <AudiobookUpload bookId={book.id} initialPath={audioPath} initialName={audioName} onUploaded={onAudioUploaded} onRemoved={onAudioRemoved} />
        <p className="mt-2 text-xs text-[#94A3B8]">MP3 · M4A · max 500 MB</p>
        {audioPath && <p className="mt-1 break-all text-[10px] text-[#CBD5E1] font-mono">{audioPath}</p>}
      </SectionCard>

      <div className="pb-4">
        <button
          type="button"
          onClick={() => router.push("/admin/books")}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Books
        </button>
      </div>
    </div>
  );
}
