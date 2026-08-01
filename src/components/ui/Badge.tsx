import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "emerald" | "outline" | "navy" | "amber" | "red";

const styles: Record<BadgeVariant, string> = {
  default: "bg-[#F1F5F9] text-[#475569]",
  emerald: "bg-[#ECFDF5] text-[#059669] border border-[#10B981]/15",
  navy:    "bg-[#0B1220] text-white",
  outline: "border border-[#E2E8F0] text-[#475569] bg-white",
  amber:   "bg-amber-50 text-amber-700 border border-amber-200/60",
  red:     "bg-red-50 text-red-600 border border-red-200/60",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight leading-none",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
