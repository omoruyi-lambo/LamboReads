import Link from "next/link";

export function ReaderNotFound({ reason = "not-found" }: { reason?: "not-found" | "file-missing" | "storage" }) {
  const copy = reason === "file-missing" ? "This book does not have a readable file yet." : reason === "storage" ? "The book file is temporarily unavailable. Please try again later." : "We could not find this published book in the LamboReads library.";
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center"><div className="max-w-md"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">LamboReads Reader</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Book not available</h1><p className="mt-3 text-slate-600">{copy}</p><Link href="/library" className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Return to library</Link></div></main>;
}
