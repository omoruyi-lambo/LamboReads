"use client";

import { RefreshCw } from "lucide-react";

export function OfflineReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white font-semibold hover:bg-[#059669] transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try again
    </button>
  );
}
