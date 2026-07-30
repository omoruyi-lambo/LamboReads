"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">{title}</h3>
      {children}
    </div>
  );
}

const TICK  = { fontSize: 11, fill: "#94A3B8" };
const GRID  = "#F1F5F9";
const GREEN = "#10B981";
const NAVY  = "#0B1220";
const BLUE  = "#3B82F6";

export function UserGrowthChart({ data }: { data: { month: string; users: number }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ChartCard title="User Signups — Last 6 Months">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }} />
          <Line type="monotone" dataKey="users" stroke={GREEN} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="New Users" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DownloadsChart({ data }: { data: { month: string; downloads: number }[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ChartCard title="Downloads — Last 6 Months">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }} />
          <Bar dataKey="downloads" fill={NAVY} radius={[4, 4, 0, 0]} name="Downloads" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function WaitlistChart({
  data,
}: {
  data: { month: string; premium: number; audiobook: number }[];
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <ChartCard title="Waitlist Growth — Last 6 Months">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="premium"   fill="#F59E0B" radius={[4, 4, 0, 0]} name="Premium"   />
          <Bar dataKey="audiobook" fill={GREEN}   radius={[4, 4, 0, 0]} name="Audiobook" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ReadingSessionsChart({
  data,
}: {
  data: { month: string; sessions: number }[];
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <ChartCard title="Reading Sessions — Last 6 Months">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }} />
          <Line type="monotone" dataKey="sessions" stroke={BLUE} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Sessions" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-[#E5E7EB]">
      <p className="text-sm text-[#94A3B8]">No data yet</p>
    </div>
  );
}
