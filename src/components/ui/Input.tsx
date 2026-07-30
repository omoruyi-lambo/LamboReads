import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none transition-all duration-150 focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50 disabled:bg-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

