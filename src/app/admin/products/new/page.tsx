import { ProductForm } from "@/products/product-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <ProductForm mode="create" />
    </div>
  );
}
