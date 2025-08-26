import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { redirect } from "next/navigation";
import { ProductForm } from "@/products/product-form";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();

export default async function NewProductPage() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
    redirect("/auth/sign-in");
  }

  return <ProductForm mode="create" />;
}
