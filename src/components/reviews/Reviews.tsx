"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, Heart, Loader2, Send, Star, UserCircle } from "lucide-react";
import { getCurrentSession } from "@/lib/supabase/auth";

type Review = { id: string; user_id: string; rating: number; title: string | null; body: string; spoiler: boolean; likes_count: number; created_at: string; liked: boolean; verified: boolean; profile: { full_name?: string | null; avatar_url?: string | null } | null };
type ReviewData = { reviews: Review[]; count: number; total: number; average: number; distribution: Record<number, number> };

function Stars({ value, interactive = false, onChange }: { value: number; interactive?: boolean; onChange?: (value: number) => void }) {
  return <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" disabled={!interactive} onClick={() => onChange?.(star)} aria-label={`${star} stars`} className={interactive ? "rounded p-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500" : "cursor-default"}><Star className={`h-4 w-4 ${star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} /></button>)}
  </div>;
}

export function Reviews({ bookId }: { bookId: number }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [sort, setSort] = useState("newest");
  const [minRating, setMinRating] = useState("0");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [spoilerOnly, setSpoilerOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState({ rating: 0, title: "", body: "", spoiler: false });

  const load = useCallback(async (nextPage = 0, append = false) => {
    setLoading(true);
    const session = await getCurrentSession();
    const query = new URLSearchParams({ bookId: String(bookId), sort, page: String(nextPage), minRating, verified: String(verifiedOnly), spoiler: String(spoilerOnly) });
    const response = await fetch(`/api/reviews?${query}`, { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined });
    if (response.ok) { const next = await response.json() as ReviewData; setData((previous) => append && previous ? { ...next, reviews: [...previous.reviews, ...next.reviews] } : next); setPage(nextPage); }
    setLoading(false);
  }, [bookId, sort, minRating, verifiedOnly, spoilerOnly]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const session = await getCurrentSession();
    if (!session) return;
    const action = editing ? "update" : "create";
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action, bookId, reviewId: editing?.id, ...form }) });
    if (response.ok) { setComposerOpen(false); setEditing(null); setForm({ rating: 0, title: "", body: "", spoiler: false }); void load(); }
  };

  const act = async (body: Record<string, unknown>) => { const session = await getCurrentSession(); if (!session) return; await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(body) }); void load(page); };
  const average = data?.average ?? 0;

  return <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="reviews-heading">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Reader community</p><h2 id="reviews-heading" className="mt-2 text-3xl font-bold text-slate-900">Reviews & ratings</h2></div><button type="button" onClick={() => { setEditing(null); setComposerOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"><Send className="h-4 w-4" /> Write a review</button></div>
      <div className="mt-8 grid gap-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[180px_1fr] sm:p-8"><div className="text-center"><p className="text-5xl font-bold text-slate-900">{average.toFixed(1)}</p><Stars value={Math.round(average)} /><p className="mt-2 text-sm text-slate-500">{data?.total ?? 0} ratings</p></div><div className="space-y-2">{[5,4,3,2,1].map((rating) => { const total = data?.total ?? 0; const amount = data?.distribution[rating] ?? 0; return <div key={rating} className="flex items-center gap-3 text-sm"><span className="w-10 text-slate-600">{rating} star</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-400" style={{ width: `${total ? amount / total * 100 : 0}%` }} /></div><span className="w-8 text-right text-slate-500">{amount}</span></div>; })}</div></div>
      {composerOpen && <form onSubmit={submit} className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{editing ? "Edit your review" : "Share your experience"}</h3><Stars value={form.rating} interactive onChange={(rating) => setForm((current) => ({ ...current, rating }))} /></div><input required value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Review title" className="mt-4 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" /><textarea required value={form.body} onChange={(e) => setForm((current) => ({ ...current, body: e.target.value }))} placeholder="What did you think?" rows={5} className="mt-3 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm" /><label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.spoiler} onChange={(e) => setForm((current) => ({ ...current, spoiler: e.target.checked }))} /> Contains spoilers</label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setComposerOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">Cancel</button><button disabled={form.rating === 0 || !form.body.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish review</button></div></form>}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold text-slate-900">What readers are saying</h3><div className="flex flex-wrap items-center gap-2"><select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filter by minimum rating"><option value="0">All ratings</option><option value="5">5 stars</option><option value="4">4+ stars</option><option value="3">3+ stars</option></select><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} /> Verified only</label><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={spoilerOnly} onChange={(e) => setSpoilerOnly(e.target.checked)} /> Spoilers</label><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Sort reviews"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option><option value="helpful">Most helpful</option></select></div></div>
      <div className="mt-5 space-y-4">{data?.reviews.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">{review.profile?.avatar_url ? <img src={review.profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-6 w-6 text-slate-400" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{review.profile?.full_name ?? "LamboReads reader"}</p>{review.verified && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Verified reader</span>}<span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span></div><div className="mt-1 flex items-center gap-3"><Stars value={review.rating} /><span className="text-xs text-slate-500">{review.rating}/5</span></div></div></div>{review.title && <h4 className="mt-4 font-semibold text-slate-900">{review.title}</h4>}{review.spoiler ? <details className="mt-2"><summary className="cursor-pointer text-sm font-medium text-amber-700">Contains spoilers — show review</summary><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.body}</p></details> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.body}</p>}<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500"><button type="button" onClick={() => void act({ action: "like", reviewId: review.id, liked: !review.liked })} className={`inline-flex items-center gap-1.5 ${review.liked ? "text-rose-600" : "hover:text-rose-600"}`} aria-label={review.liked ? "Remove helpful vote" : "Mark review helpful"}><Heart className={`h-4 w-4 ${review.liked ? "fill-current" : ""}`} /> Helpful ({review.likes_count})</button><button type="button" onClick={() => { const reason = window.prompt("Why are you reporting this review? (spam, offensive, false_information, other)"); if (reason) void act({ action: "report", reviewId: review.id, reason }); }} className="inline-flex items-center gap-1.5 hover:text-red-600"><Flag className="h-4 w-4" /> Report</button></div></article>)}{loading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>}{!loading && !data?.reviews.length && <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">No reviews yet. Be the first to share your experience.</p>}{data && data.reviews.length < data.count && <button type="button" onClick={() => void load(page + 1, true)} className="mx-auto block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:border-emerald-500">Load more reviews</button>}</div>
    </div>
  </section>;
}
