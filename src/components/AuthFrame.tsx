"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function AuthFrame({
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
    <div className="py-12">
      <div className={cn(
        "relative z-10 mx-auto w-full max-w-md rounded-2xl border border-slate-200",
        "bg-white p-6 shadow-card backdrop-blur",
        className
      )}>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
