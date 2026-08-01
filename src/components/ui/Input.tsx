import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#111827]",
      "placeholder:text-[#94A3B8] outline-none",
      "transition-all duration-150",
      "focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/15",
      "disabled:opacity-50 disabled:bg-slate-100",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
