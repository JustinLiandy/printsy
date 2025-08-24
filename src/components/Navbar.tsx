// src/components/Navbar.tsx
'use client';

import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL; // public gate for UI

export default function Navbar() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => mounted && setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setUser(s?.user ?? null);
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
            <Link href="/seller/designs/new" className="transition hover:text-brand-600">Sell</Link>
            {isAdmin && <Link href="/admin" className="transition hover:text-brand-600">Admin</Link>}
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
            <button
              onClick={login}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              Login
            </button>
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
              <Link href="/seller/designs/new" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>Sell</Link>
              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={()=>setOpen(false)}>Admin</Link>
              )}
              <div className="mt-2">
                {user ? (
                  <button onClick={logout} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-400 hover:text-red-500">Logout</button>
                ) : (
                  <button onClick={login} className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Login</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
