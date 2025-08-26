// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
        >
          ← Back home
        </Link>
      </div>
    </div>
  );
}