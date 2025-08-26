"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

export default function AdminPage() {
  const supabase = supabaseBrowser();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const email = data.user?.email?.toLowerCase();
      setAllowed(!!email && email === ADMIN_EMAIL);
    });
    return () => { mounted = false; };
  }, [supabase]);

  if (allowed === null) return <div className="p-6">Checking access…</div>;
  if (!allowed) return <div className="p-6 text-red-600">Not authorized.</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Admin</h1>
      <p className="text-slate-600">Your admin tools go here.</p>
    </div>
  );
}
