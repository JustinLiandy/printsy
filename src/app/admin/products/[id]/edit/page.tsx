import { notFound } from "next/navigation";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { ProductForm } from "@/products/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServerRSC();

  const { data: p, error } = await supabase
    .from("base_products")
    .select("id,name,slug,description,base_cost,active")
    .eq("id", params.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!p) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <ProductForm mode="edit" initial={p} />
    </div>
  );
}
