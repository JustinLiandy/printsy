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

    async function hydrate() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user ?? null);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_seller")
          .eq("id", user.id)
          .maybeSingle();
        setIsSeller(Boolean(data?.is_seller));
      } else {
        setIsSeller(false);
      }
    }

    hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("profiles").select("is_seller").eq("id", u.id).maybeSingle()
          .then(({ data }) => setIsSeller(Boolean(data?.is_seller)));
      } else {
        setIsSeller(false);
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [supabase]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    location.href = "/";
  }

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
            {user && (
              <Link href="/profile" className="transition hover:text-brand-600">
                Profile
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <input
            placeholder="Search designs..."
            className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
          />
          {user ? (
            <>
              <span className="hidden lg:inline text-sm text-slate-700">Hi, {user.email}</span>
              <button
                onClick={logout}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="mb-3">
              <input
                placeholder="Search designs..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <Link href="/" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>Home</Link>
              {!isSeller && user && (
                <Link href="/seller/onboarding" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>
                  Become a Seller
                </Link>
              )}
              {isSeller && (
                <Link href="/seller" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>
                  Seller
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>
                  Admin
                </Link>
              )}
              {user && (
                <Link href="/profile" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>
                  Profile
                </Link>
              )}
              <div className="mt-2">
                {user ? (
                  <button onClick={logout} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-400 hover:text-red-500">
                    Logout
                  </button>
                ) : (
                  <Link href="/auth/sign-in" className="block w-full rounded-xl bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
