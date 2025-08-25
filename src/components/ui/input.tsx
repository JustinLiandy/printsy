import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition",
          "bg-white text-slate-900 placeholder-slate-400 border-slate-300",
          // lighter ring
          "focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:border-brand-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-red-400 aria-invalid:focus-visible:ring-red-500",
          "file:inline-flex file:h-8 file:items-center file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:text-sm file:font-medium file:text-slate-700 file:hover:bg-slate-200",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";