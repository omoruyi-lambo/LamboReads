"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Props {
  authorId: string;
  currentStatus: string;
  compact?: boolean;
}

export function AdminAuthorActions({ authorId, currentStatus, compact }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const update = async (action: "approved" | "rejected") => {
    setLoading(action === "approved" ? "approve" : "reject");
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from("authors")
        .update({
          status: action,
          approved_at: action === "approved" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authorId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (currentStatus === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#10B981] font-medium">
        <CheckCircle className="h-3.5 w-3.5" /> Approved
      </span>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading === "approve"}
        onClick={() => update("approved")}
        className="text-xs flex items-center gap-1"
      >
        {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
        Re-approve
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
      <Button
        variant="emerald"
        size="sm"
        disabled={!!loading}
        onClick={() => update("approved")}
        className="text-xs flex items-center gap-1"
      >
        {loading === "approve" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() => update("rejected")}
        className="text-xs flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Reject
      </Button>
    </div>
  );
}
