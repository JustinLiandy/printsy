"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function InlineAlert({
  kind = "error",
  children,
  className,
}: {
  kind?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    kind === "error"
      ? "bg-red-50 text-red-800 ring-1 ring-red-200"
      : kind === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
  return (
    <div
      className={cn(
        "mb-4 rounded-lg px-3 py-2 text-sm",
        styles,
        className
      )}
    >
      {children}
    </div>
  );
}
