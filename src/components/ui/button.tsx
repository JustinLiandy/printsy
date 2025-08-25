"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-brand-600 text-white hover:bg-brand-700",
  outline: "border border-slate-300 text-slate-800 hover:bg-slate-50",
  ghost:  "text-slate-700 hover:bg-slate-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
} as const;

export function Button({
  asChild,
  variant = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof variants;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "outline-none ring-brand-300 transition focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
