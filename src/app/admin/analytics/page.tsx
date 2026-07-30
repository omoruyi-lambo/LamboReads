import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BookOpen, Users, Download, TrendingUp } from "lucide-react";
import {
  UserGrowthChart,
  DownloadsChart,
  WaitlistChart,
  ReadingSessionsChart,
} from "./AnalyticsCharts";

export const metadata = { title: "Analytics — Admin" };

// Build a 6-month label array ending this month
function last6Months() {
  const months: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return months;
}

function bucketByMonth<T extends { created_at?: string; joined_at?: string }>(
  rows: T[],
  months: ReturnType<typeof last6Months>,
  dateField: keyof T = "created_at" as keyof T
): number[] {
  return months.map(({ year, month }) =>
    rows.filter((r) => {
      const raw = r[dateField] as unknown as string | undefined;
      if (!raw) return false;
      const d = new Date(raw);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    }).length
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const sb = supabaseAdmin;
  const months = last6Months();

  let totalBooks = 0, totalUsers = 0, totalDownloads = 0, totalSessions = 0;
  let userRows:    any[] = [];
  let downloadRows:any[] = [];
  let premWait:    any[] = [];
  let audWait:     any[] = [];
  let sessionRows: any[] = [];

  if (sb) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const since = sixMonthsAgo.toISOString();

    const [
      { count: bc }, { count: uc }, { count: dc }, { count: sc },
      { data: ud }, { data: dd }, { data: pw }, { data: aw }, { data: sd },
    ] = await Promise.all([
      sb.from("books").select("*",          { count: "exact", head: true }),
      sb.from("profiles").select("*",       { count: "exact", head: true }),
      sb.from("downloads").select("*",      { count: "exact", head: true }),
      sb.from("reading_history").select("*",{ count: "exact", head: true }),

      sb.from("profiles")        .select("created_at").gte("created_at", since),
      sb.from("downloads")       .select("created_at").gte("created_at", since),
      sb.from("premium_waitlist").select("joined_at").gte("joined_at", since),
      sb.from("audiobook_waitlist").select("joined_at").gte("joined_at", since),
      sb.from("reading_history") .select("created_at").gte("created_at", since),
    ]);

    totalBooks    = bc ?? 0;
    totalUsers    = uc ?? 0;
    totalDownloads= dc ?? 0;
    totalSessions = sc ?? 0;

    userRows     = ud ?? [];
    downloadRows = dd ?? [];
    premWait     = pw ?? [];
    audWait      = aw  ?? [];
    sessionRows  = sd ?? [];
  }

  const labels      = months.map((m) => m.label);
  const userCounts  = bucketByMonth(userRows,     months, "created_at");
  const dlCounts    = bucketByMonth(downloadRows, months, "created_at");
  const premCounts  = bucketByMonth(premWait,     months, "joined_at");
  const audCounts   = bucketByMonth(audWait,      months, "joined_at");
  const sessCounts  = bucketByMonth(sessionRows,  months, "created_at");

  const userGrowthData    = labels.map((m, i) => ({ month: m, users:    userCounts[i] }));
  const downloadData      = labels.map((m, i) => ({ month: m, downloads:dlCounts[i]   }));
  const waitlistData      = labels.map((m, i) => ({ month: m, premium:  premCounts[i], audiobook: audCounts[i] }));
  const sessionData       = labels.map((m, i) => ({ month: m, sessions: sessCounts[i] }));

  const summaryStats = [
    { label: "Total Books",      value: totalBooks,    icon: BookOpen,   color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
    { label: "Registered Users", value: totalUsers,    icon: Users,      color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
    { label: "Total Downloads",  value: totalDownloads,icon: Download,   color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
    { label: "Reading Sessions", value: totalSessions, icon: TrendingUp, color: "text-[#EC4899]", bg: "bg-[#FCE7F3]" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Analytics</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Platform metrics from Supabase</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-[#111827] tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts — 2 col grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <UserGrowthChart    data={userGrowthData} />
        <DownloadsChart     data={downloadData}   />
        <WaitlistChart      data={waitlistData}   />
        <ReadingSessionsChart data={sessionData}  />
      </div>
    </div>
  );
}
