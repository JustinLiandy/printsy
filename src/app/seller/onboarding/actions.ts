"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";

const schema = z.object({
  shop_name: z.string().min(3),
  payout_type: z.string().min(2),
  payout_name: z.string().min(2),
  payout_account: z.string().min(4),
  tax_id: z.string().optional().nullable(),
});

export async function completeOnboarding(values: unknown) {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join(", "));
  }

  const supabase = await supabaseServerRSC();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!user) throw new Error("Not authenticated.");

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        is_seller: true,
        shop_name: parsed.data.shop_name,
        payout_type: parsed.data.payout_type,
        payout_name: parsed.data.payout_name,
        payout_account: parsed.data.payout_account,
        tax_id: parsed.data.tax_id ?? null,
      },
      { onConflict: "id" }
    );

  if (error) throw new Error(error.message);

  // Guaranteed navigation on success
  redirect("/seller");
}
