import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/products/product-form";
import ProductAssets from "@/products/product-assets";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
    redirect("/auth/sign-in");
  }

  const { data: p } = await supabase
    .from("base_products")
    .select("id,name,description,slug,base_cost,active")
    .eq("id", params.id)
    .single();

  if (!p) notFound();

  return (
    <>
      <ProductForm mode="edit" initial={p} />
      <ProductAssets productId={p.id} />
    </>
  );
}
