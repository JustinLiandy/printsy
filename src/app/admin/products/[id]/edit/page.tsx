import { redirect, notFound } from "next/navigation";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { ProductForm } from "@/products/product-form";
// If alias keeps failing, comment the line above and use the relative import below instead:
// import { ProductForm } from "../../product-form";
import ProductAssets from "@/products/product-assets";
// If alias keeps failing, comment the line above and use the relative import below instead:
// import ProductAssets from "../../product-assets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await supabaseServerRSC();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/admin/products");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data: product, error } = await supabase
    .from("base_products")
    .select("id,name,description,base_cost,slug,active")
    .eq("id", params.id)
    .single();

  if (error || !product) notFound();

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm mode="edit" initial={product} />
      <ProductAssets productId={product.id} />
    </div>
  );
}
