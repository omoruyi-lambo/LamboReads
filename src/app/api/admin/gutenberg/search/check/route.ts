import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) return NextResponse.json({ existing: [] });

  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ existing: [] });

  const { data } = await supabaseAdmin
    .from("books")
    .select("external_id")
    .in("external_id", ids.map(String));

  const existing = (data ?? []).map((r: { external_id: string }) => Number(r.external_id));
  return NextResponse.json({ existing });
}
