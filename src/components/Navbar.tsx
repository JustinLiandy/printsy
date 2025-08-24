'use client';

import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (isMounted) setUser(data.user ?? null);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogin = async () => {
    const email = prompt("Enter your email to receive a magic login link:");
    if (email) {
      await supabase.auth.signInWithOtp({ email });
      alert("Check your email for the login link!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-emerald-600">
          Printsy
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="transition hover:text-emerald-600">Home</Link>
          <Link href="/seller/designs/new" className="transition hover:text-emerald-600">Sell</Link>
          <Link href="/admin" className="transition hover:text-emerald-600">Admin</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-700">Hi, {user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
