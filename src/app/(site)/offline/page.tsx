import Link from "next/link";
import { BookOpen, WifiOff } from "lucide-react";
import { OfflineReloadButton } from "./OfflineReloadButton";

export const metadata = {
  title: "You're Offline — LamboReads",
  description: "No internet connection. Check your connection and try again.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-[#F0FDF4] flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-[#10B981]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center border-2 border-white">
          <WifiOff className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-[#0B1220] mb-3">
        You&apos;re offline
      </h1>
      <p className="text-[#64748B] text-lg max-w-sm mb-8">
        It looks like you lost your internet connection. Check your signal and
        try again — your library is waiting.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <OfflineReloadButton />
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#E5E7EB] text-[#0B1220] font-semibold hover:bg-[#F8FAFC] transition-colors"
        >
          Go home
        </Link>
      </div>

      {/* Tip */}
      <p className="mt-12 text-sm text-[#94A3B8]">
        Tip: pages you&apos;ve visited recently may still be available while
        offline.
      </p>
    </div>
  );
}
