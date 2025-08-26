// src/products/product-form.tsx
import { saveBaseProduct } from "@/app/admin/products/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type BaseProduct = {
  id: string;
  name: string;
  description: string | null;
  base_cost: number;
  slug: string;
  active: boolean;
};

export function ProductForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<BaseProduct>;
}) {
  return (
    <form
      action={saveBaseProduct}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-soft"
    >
      {mode === "edit" && initial?.id && (
        <input type="hidden" name="id" defaultValue={initial.id} />
      )}

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          placeholder="tshirt-classic"
          defaultValue={initial?.slug ?? ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="base_cost">Base cost (IDR)</Label>
        <Input
          id="base_cost"
          name="base_cost"
          type="number"
          step="1"
          min="0"
          required
          defaultValue={
            typeof initial?.base_cost === "number" ? String(initial.base_cost) : ""
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Short description (optional)"
          defaultValue={initial?.description ?? ""}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4 accent-brand-600"
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit">{mode === "edit" ? "Save changes" : "Create"}</Button>
      </div>
    </form>
  );
}
