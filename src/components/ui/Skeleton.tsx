import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-[#F1F5F9]", className)}
      style={style}
      aria-hidden
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {/* Cover — matches the 2:3 ratio used by BookCard */}
      <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "2/3" } as React.CSSProperties} />
      {/* Genre badge placeholder */}
      <Skeleton className="h-[10px] w-16 rounded" />
      {/* Title — two lines */}
      <Skeleton className="h-[13px] w-full rounded" />
      <Skeleton className="h-[13px] w-3/4 rounded" />
      {/* Author */}
      <Skeleton className="h-[11px] w-1/2 rounded mt-0.5" />
    </div>
  );
}
