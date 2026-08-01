import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "emerald";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#0B1220] text-white hover:bg-[#162032] active:bg-[#0B1220] active:scale-[0.98] shadow-sm shadow-black/10",
  secondary:
    "bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB] hover:bg-[#F1F5F9] active:scale-[0.98]",
  outline:
    "border border-[#E2E8F0] text-[#334155] bg-white hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#F0FDF4] active:scale-[0.98]",
  ghost:
    "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] active:scale-[0.98]",
  emerald:
    "bg-[#10B981] text-white hover:bg-[#059669] active:bg-[#047857] active:scale-[0.98] shadow-sm shadow-emerald-500/20",
};

const sizes = {
  sm: "h-8 px-3.5 text-xs font-medium rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm font-medium rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] font-semibold rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-sans transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
