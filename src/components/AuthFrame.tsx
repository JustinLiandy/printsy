"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function AuthFrame({
  title,
  subtitle,
  children,
  footer,
  className,
}: Props) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white shadow-card",
          className
        )}
      >
        <div className="space-y-1 px-6 pb-2 pt-6">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        <div className="px-6 pb-6">{children}</div>

        <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-600">
          {footer ?? (
            <>
              Don’t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-brand-600 hover:underline"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
