// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await supabaseServerRSC(); // <-- await here

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_seller")
    .eq("id", user.id)
    .maybeSingle();

  const isSeller = Boolean(profile?.is_seller);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm">
          <span className="text-slate-500">Email:</span> {user.email}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isSeller ? (
          <Link href="/seller/onboarding">
            <Button>Become a Seller</Button>
          </Link>
        ) : (
          <Link href="/seller">
            <Button variant="outline">Go to Seller dashboard</Button>
          </Link>
        )}
        <LogoutButton />
      </div>
    </div>
  );
}
