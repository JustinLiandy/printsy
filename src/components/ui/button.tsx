"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Tailwind brand swatch is in your tailwind.config.ts (brand-50..900).
 * These variants are readable on WHITE backgrounds and accessible.
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl",
    "text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "active:translate-y-[1px]",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        /** primary: brand background + white text */
        default:
          "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
        /** subtle on white, still visible */
        secondary:
          "bg-brand-50 text-brand-700 hover:bg-brand-100",
        /** white button with border; always readable on white pages */
        outline:
          "border border-slate-300 bg-white text-slate-800 hover:border-brand-300 hover:text-brand-700 disabled:bg-white disabled:text-slate-400 disabled:border-slate-200",
        /** minimal */
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100",
        /** destructive actions */
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        /** looks like a link */
        link:
          "bg-transparent text-brand-700 underline underline-offset-4 hover:text-brand-800"
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-[0.95rem]",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** shows a spinner and sets aria-busy for a11y */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <svg
            aria-hidden
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
        <span className="whitespace-nowrap">{children}</span>
      </Comp>
    );
  }
);
Button.displayName = "Button";
