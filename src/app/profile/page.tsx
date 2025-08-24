"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      if (user) {
        const { data } = await supabase.from("profiles").select("is_seller").eq("id", user.id).maybeSingle();
        setIsSeller(Boolean(data?.is_seller));
      }
    })();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          You’re not logged in. <Link href="/auth/sign-in" className="text-brand-600 underline">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm"><span className="text-slate-500">Email:</span> {user.email}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!isSeller ? (
          <Link href="/seller/onboarding"><Button>Become a Seller</Button></Link>
        ) : (
          <Link href="/seller"><Button variant="outline">Go to Seller dashboard</Button></Link>
        )}
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}
