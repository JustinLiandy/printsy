// src/components/Navbar.tsx
'use client';

import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Navbar() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user ?? null);
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("is_seller")
            .eq("id", user.id)
            .maybeSingle();
          setIsSeller(Boolean(data?.is_seller));
        }
      }
    }

    fetchUser();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("is_seller")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => setIsSeller(Boolean(data?.is_seller)));
      } else {
        setIsSeller(false);
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [supabase]);

  const login = async () => {
    const email = prompt("Enter your email:");
    if (email) {
      await supabase.auth.signInWithOtp({ email });
      alert("Magic link sent. Check your email.");
    }
  };
  const logout = () => supabase.auth.signOut();

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand-600">Printsy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="transition hover:text-brand-600">Home</Link>
            {!isSeller && user && (
              <Link href="/seller/onboarding" className="transition hover:text-brand-600">
                Become a Seller
              </Link>
            )}
            {isSeller && (
              <Link href="/seller" className="transition hover:text-brand-600">
                Seller
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="transition hover:text-brand-600">
                Admin
              </Link>
            )}
          </nav>
        </div>
        {/* ... keep your search + login/logout UI the same ... */}
      </div>
      {/* ... keep your mobile drawer logic, just swap in the same conditional links ... */}
    </header>
  );
}
