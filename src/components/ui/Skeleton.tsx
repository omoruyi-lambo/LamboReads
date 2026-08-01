import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-[#F1F5F9] via-[#E9EEF4] to-[#F1F5F9] bg-[length:200%_100%]",
        className
      )}
      style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="h-[13px] w-3/4 rounded" />
      <Skeleton className="h-[11px] w-1/2 rounded" />
    </div>
  );
}
