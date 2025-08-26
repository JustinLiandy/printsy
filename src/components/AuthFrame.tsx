// src/components/AuthFrame.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Clean, centered auth layout with a branded header and footer slot */
export default function AuthFrame({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top brand bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-slate-900"
            aria-label="Back to home"
          >
            <span className="text-brand-600">Printsy</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-brand-600"
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* Card */}
      <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          ) : null}

          <div className="mt-6">{children}</div>

          {footer ? (
            <div className="mt-6 border-t pt-4 text-center text-sm text-slate-600">
              {footer}
            </div>
          ) : null}
        </div>
      </main>

      {/* Tiny footer */}
      <footer className="py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Printsy
      </footer>
    </div>
  );
}
