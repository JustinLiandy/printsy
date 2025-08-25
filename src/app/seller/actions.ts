"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";

export async function setPublish(id: string, publish: boolean) {
  const supabase = await supabaseServerRSC();

  // Verify current user; RLS will still guard the update
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!user) throw new Error("Not authenticated.");

  const { error } = await supabase
    .from("designs")
    .update({ is_published: publish })
    .eq("id", id)
    .eq("owner", user.id); // extra belt‑and‑suspenders

  if (error) throw new Error(error.message);

  revalidatePath("/seller");
}
