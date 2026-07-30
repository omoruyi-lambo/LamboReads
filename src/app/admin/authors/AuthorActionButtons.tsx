"use client";

import { useTransition } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { updateAuthorStatus } from "./actions";

export function AuthorActionButtons({
  authorId,
  status,
}: {
  authorId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status !== "pending") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
          status === "approved"
            ? "bg-[#ECFDF5] text-[#059669]"
            : "bg-red-50 text-red-600"
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => updateAuthorStatus(authorId, "approved"))
        }
        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#059669] hover:bg-emerald-100 disabled:opacity-50 transition-colors"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Approve
      </button>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => updateAuthorStatus(authorId, "rejected"))
        }
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" />
        Reject
      </button>
    </div>
  );
}
