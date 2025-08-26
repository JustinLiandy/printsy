// Server component (no "use client")
import Link from "next/link";
import { createProduct, updateProduct, deleteProduct } from "@/app/admin/products/actions";
import { SubmitButton } from "@/app/admin/products/submit-button";
import { DeleteProductButton } from "@/app/admin/products/delete-product-button";
type Product = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  base_cost: number;
  active: boolean;
};

export function ProductForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Product;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {mode === "create" ? "Create base product" : "Edit base product"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Admin-only base catalog (like Printify blanks).
        </p>
      </header>

      <form action={mode === "create" ? createProduct : updateProduct} className="space-y-6">
        {mode === "edit" && initial?.id ? (
          <input type="hidden" name="id" defaultValue={initial.id} />
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="T-Shirt Classic"
              defaultValue={initial?.name ?? ""}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="base_cost" className="mb-1 block text-sm font-medium text-slate-700">
              Base cost (IDR)
            </label>
            <input
              id="base_cost"
              name="base_cost"
              type="number"
              step="1"
              min="0"
              placeholder="65000"
              defaultValue={initial?.base_cost ?? 0}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-700">
            Slug (optional)
          </label>
          <input
            id="slug"
            name="slug"
            placeholder="t-shirt-classic"
            defaultValue={initial?.slug ?? ""}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
          />
          <p className="mt-1 text-xs text-slate-500">
            Leave blank to auto-generate a unique slug from the name.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Short description for sellers…"
            defaultValue={initial?.description ?? ""}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          <span className="text-sm text-slate-700">Active (visible to sellers)</span>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <SubmitButton label={mode === "create" ? "Save product" : "Save changes"} />
          <Link href="/admin/products" className="inline-block">
            <button type="button" className="rounded-md border px-3 py-2 text-sm">
              Cancel
            </button>
          </Link>
        </div>
      </form>

      {mode === "edit" && initial?.id ? (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Danger zone</h3>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={initial.id} />
            <DeleteProductButton />
          </form>
        </div>
      ) : null}
    </div>
  );
}
