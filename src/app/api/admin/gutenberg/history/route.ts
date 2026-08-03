import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });
  }

  const page  = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = 20;
  const from  = (page - 1) * limit;

  const { data, count, error } = await supabaseAdmin
    .from("import_logs")
    .select("*", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data ?? [], count: count ?? 0, page, limit });
}
