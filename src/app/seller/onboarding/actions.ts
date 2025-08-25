// src/app/seller/onboarding/actions.ts
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
  const parsed = schema.parse(values);

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
        shop_name: parsed.shop_name,
        payout_type: parsed.payout_type,
        payout_name: parsed.payout_name,
        payout_account: parsed.payout_account,
        tax_id: parsed.tax_id ?? null,
      },
      { onConflict: "id" }
    );

  if (error) throw new Error(error.message);
  redirect("/seller");
}
