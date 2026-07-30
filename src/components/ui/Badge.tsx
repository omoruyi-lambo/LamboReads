import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "emerald" | "outline" | "navy";

const styles: Record<BadgeVariant, string> = {
  default: "bg-[#F1F5F9] text-[#475569]",
  emerald: "bg-[#ECFDF5] text-[#059669] border border-[#10B981]/20",
  navy: "bg-[#0B1220] text-white",
  outline: "border border-[#E5E7EB] text-[#475569] bg-white",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

