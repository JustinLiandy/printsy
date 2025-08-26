import { ProductForm } from "@/products/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">New product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
