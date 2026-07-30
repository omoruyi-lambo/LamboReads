import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "emerald";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#0B1220] text-white hover:bg-[#0B1220]/90 active:scale-[0.98] shadow-sm",
  secondary: "bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB] hover:bg-[#F1F5F9] active:scale-[0.98]",
  outline: "border border-[#E5E7EB] text-[#334155] hover:border-[#10B981] hover:text-[#10B981] bg-white active:scale-[0.98]",
  ghost: "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] active:scale-[0.98]",
  emerald: "bg-[#10B981] text-white hover:bg-[#059669] active:scale-[0.98] shadow-sm",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg",
  md: "px-4 py-2.5 text-sm font-medium rounded-xl",
  lg: "px-6 py-3.5 text-base font-semibold rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
