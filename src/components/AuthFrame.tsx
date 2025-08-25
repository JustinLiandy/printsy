"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthFrame({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto max-w-md p-6">
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white/90 shadow-card backdrop-blur",
          "px-6 py-7"
        )}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
export default AuthFrame;
