// src/app/error.tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something broke while loading.</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
