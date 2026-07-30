import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

async function userFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data.user ?? null;
}

function bookId(value: string | null) { const id = Number(value); return Number.isInteger(id) ? id : null; }

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const id = bookId(request.nextUrl.searchParams.get("bookId"));
  if (id === null) return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  const sort = request.nextUrl.searchParams.get("sort") ?? "newest";
  const minRating = Number(request.nextUrl.searchParams.get("minRating") ?? 0);
  const verifiedOnly = request.nextUrl.searchParams.get("verified") === "true";
  const spoilerOnly = request.nextUrl.searchParams.get("spoiler") === "true";
  const page = Math.max(0, Number(request.nextUrl.searchParams.get("page") ?? 0));
  const size = 10;
  let query = supabaseAdmin.from("reviews").select("id,user_id,book_id,rating,title,body,spoiler,likes_count,status,created_at,updated_at", { count: "exact" }).eq("book_id", id).eq("status", "published");
  if (minRating >= 1 && minRating <= 5) query = query.gte("rating", minRating);
  if (spoilerOnly) query = query.eq("spoiler", true);
  if (verifiedOnly) {
    const { data: verifiedRows } = await supabaseAdmin.from("reading_history").select("user_id").eq("book_id", id).gte("progress", 1);
    query = query.in("user_id", (verifiedRows ?? []).map((row) => row.user_id));
  }
  const order = sort === "oldest" ? ["created_at", false] : sort === "highest" ? ["rating", false] : sort === "lowest" ? ["rating", true] : sort === "helpful" ? ["likes_count", false] : ["created_at", false];
  query = query.order(order[0] as string, { ascending: order[1] as boolean }).range(page * size, page * size + size - 1);
  const { data: reviews, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = reviews ?? [];
  const user = await userFromRequest(request);
  const [profiles, likes, verified] = await Promise.all([
    supabaseAdmin.from("profiles").select("id,full_name,avatar_url").in("id", rows.map((r) => r.user_id)),
    user ? supabaseAdmin.from("review_likes").select("review_id").eq("user_id", user.id).in("review_id", rows.map((r) => r.id)) : Promise.resolve({ data: [] }),
    supabaseAdmin.from("reading_history").select("user_id").eq("book_id", id).in("user_id", rows.map((r) => r.user_id)).gte("progress", 1),
  ]);
  const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const liked = new Set((likes.data ?? []).map((l) => l.review_id));
  const verifiedUsers = new Set((verified.data ?? []).map((v) => v.user_id));
  const all = await supabaseAdmin.from("reviews").select("rating").eq("book_id", id).eq("status", "published");
  const distribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>((result, rating) => { result[rating] = (all.data ?? []).filter((r) => r.rating === rating).length; return result; }, {});
  const total = all.data?.length ?? 0;
  return NextResponse.json({ reviews: rows.map((r) => ({ ...r, profile: profileMap.get(r.user_id) ?? null, liked: liked.has(r.id), verified: verifiedUsers.has(r.user_id) })), count: count ?? 0, total, average: total ? (all.data ?? []).reduce((sum, r) => sum + r.rating, 0) / total : 0, distribution });
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const user = await userFromRequest(request); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>; const action = body.action;
  const id = Number(body.bookId); const reviewId = String(body.reviewId ?? "");
  if (action === "create" || action === "update") {
    const rating = Number(body.rating); const text = String(body.body ?? "").trim();
    if (!Number.isInteger(id) || rating < 1 || rating > 5 || !text) return NextResponse.json({ error: "Book, rating, and review body are required" }, { status: 400 });
    const payload = { rating, title: String(body.title ?? "").trim().slice(0, 160) || null, body: text.slice(0, 5000), spoiler: Boolean(body.spoiler), updated_at: new Date().toISOString() };
    const result = action === "create" ? await supabaseAdmin.from("reviews").insert({ ...payload, book_id: id, user_id: user.id }).select().single() : await supabaseAdmin.from("reviews").update(payload).eq("id", reviewId).eq("user_id", user.id).select().single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 }); return NextResponse.json({ review: result.data });
  }
  if (action === "delete") { const result = await supabaseAdmin.from("reviews").delete().eq("id", reviewId).eq("user_id", user.id); if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 }); return NextResponse.json({ ok: true }); }
  if (action === "like") { const result = body.liked ? await supabaseAdmin.from("review_likes").insert({ review_id: reviewId, user_id: user.id }) : await supabaseAdmin.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", user.id); if (result.error && result.error.code !== "23505") return NextResponse.json({ error: result.error.message }, { status: 400 }); const { count } = await supabaseAdmin.from("review_likes").select("id", { count: "exact", head: true }).eq("review_id", reviewId); return NextResponse.json({ liked: Boolean(body.liked), likes: count ?? 0 }); }
  if (action === "report") { const reason = String(body.reason ?? "other"); const result = await supabaseAdmin.from("review_reports").upsert({ review_id: reviewId, user_id: user.id, reason, details: String(body.details ?? "").slice(0, 1000) }, { onConflict: "review_id,user_id" }); if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 }); await supabaseAdmin.from("reviews").update({ status: "reported" }).eq("id", reviewId); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
