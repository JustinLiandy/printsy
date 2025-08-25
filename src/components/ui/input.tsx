"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** visually mark invalid state without relying on :invalid */
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={invalid || undefined}
        className={cn(
          // base
          "flex h-10 w-full min-w-0 rounded-xl border bg-white px-3 py-2 text-sm",
          // readable text on light backgrounds
          "text-slate-900 placeholder:text-slate-400",
          // subtle shadow + border
          "border-slate-300 shadow-xs",
          // focus ring
          "outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          // invalid
          "aria-invalid:border-red-400 aria-invalid:ring-red-200",
          // disabled
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
