"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/auth";
import { Card } from "@/components/ui/Card";

interface DownloadItem {
  id: number;
  bookId: number;
  title: string;
  format: string;
  downloadedAt: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("downloads")
          .select("*")
          .eq("user_id", user.id)
          .order("downloaded_at", { ascending: false });
        if (data) {
          setDownloads(data.map((d: { id: number; book_id: number; title: string; format: string; downloaded_at: string }) => ({
            id: d.id,
            bookId: d.book_id,
            title: d.title,
            format: d.format,
            downloadedAt: d.downloaded_at,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-7 w-40 rounded bg-[#F1F5F9] animate-pulse mb-2" />
        <div className="h-4 w-32 rounded bg-[#F1F5F9] animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#F1F5F9] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[#0B1220]">Downloads</h1>
      <p className="text-[#64748B]">Your download history</p>
      <div className="mt-8 space-y-3">
        {downloads.length === 0 ? (
          <Card className="py-12 text-center text-[#64748B]">No downloads yet.</Card>
        ) : (
          downloads.map((d) => (
            <Card key={d.id} className="flex flex-col xs:flex-row items-start xs:justify-between gap-2 p-4">
              <div>
                <p className="font-medium text-[#0B1220]">{d.title}</p>
                <p className="text-sm text-[#64748B] uppercase">{d.format}</p>
              </div>
              <p className="text-xs text-[#94A3B8]">{new Date(d.downloadedAt).toLocaleDateString()}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
