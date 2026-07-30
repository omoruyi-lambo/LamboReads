import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const list = searchParams.get("list") === "audiobook" ? "audiobook_waitlist" : "premium_waitlist";
  const q = searchParams.get("q") ?? "";

  if (!supabaseAdmin) {
    return new NextResponse("Supabase not configured", { status: 500 });
  }

  let query = supabaseAdmin
    .from(list)
    .select("name, email, joined_at")
    .order("joined_at", { ascending: false });

  if (q.trim()) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const rows = data ?? [];
  const header = "Name,Email,Joined\n";
  const body = rows
    .map((r: any) =>
      [
        `"${(r.name ?? "").replace(/"/g, '""')}"`,
        `"${(r.email ?? "").replace(/"/g, '""')}"`,
        `"${new Date(r.joined_at).toLocaleDateString()}"`,
      ].join(",")
    )
    .join("\n");

  const filename = `${list}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(header + body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
