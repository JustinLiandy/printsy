// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await supabaseServerRSC();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_seller, shop_name, payout_type, payout_name, payout_account, tax_id")
    .eq("id", user.id)
    .maybeSingle();

  const isSeller = Boolean(profile?.is_seller);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="mb-1"><span className="text-slate-500">Email:</span> {user.email}</div>
        {profile?.shop_name && (
          <div className="mb-1"><span className="text-slate-500">Shop:</span> {profile.shop_name}</div>
        )}
        {profile?.payout_type && (
          <div className="mb-1"><span className="text-slate-500">Payout:</span> {profile.payout_type} • {profile.payout_name} • {profile.payout_account}</div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isSeller ? (
          <Link href="/seller/onboarding"><Button>Become a Seller</Button></Link>
        ) : (
          <Link href="/seller"><Button variant="outline">Go to Seller dashboard</Button></Link>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}