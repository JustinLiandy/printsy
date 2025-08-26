// src/app/admin/products/actions.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";

export async function saveBaseProduct(formData: FormData) {
  const supabase = await supabaseServerRSC();

  // auth + admin gate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!user || !isAdmin) {
    throw new Error("Unauthorized");
  }

  const id = (formData.get("id") as string | null) || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const base_cost = Number(formData.get("base_cost") ?? 0);
  const description = (formData.get("description") as string | null) || null;
  const activeRaw = formData.get("active");
  const active =
    activeRaw === "on" || activeRaw === "true" || activeRaw === "1" ? true : false;

  if (!name || !slug || Number.isNaN(base_cost)) {
    throw new Error("Invalid form values");
  }

  if (id) {
    const { error } = await supabase
      .from("base_products")
      .update({ name, slug, base_cost, description, active })
      .eq("id", id);
    if (error) throw error;
    redirect(`/admin/products/${id}/edit`);
  } else {
    const { data, error } = await supabase
      .from("base_products")
      .insert({ name, slug, base_cost, description, active })
      .select("id")
      .single();
    if (error) throw error;
    redirect(`/admin/products/${data.id}/edit`);
  }
}
