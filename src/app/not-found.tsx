// src/app/not-found.tsx
import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you’re looking for doesn’t exist.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-50"
      >
        Go home
      </Link>
    </div>
  );
}