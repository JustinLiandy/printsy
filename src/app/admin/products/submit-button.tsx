"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-w-36 rounded-md border px-3 py-2 text-sm disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
