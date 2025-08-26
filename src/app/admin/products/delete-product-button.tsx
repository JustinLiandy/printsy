"use client";

import { useFormStatus } from "react-dom";

export function DeleteProductButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this base product? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
      disabled={pending}
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete product"}
    </button>
  );
}
