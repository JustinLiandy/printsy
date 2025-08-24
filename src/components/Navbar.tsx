// src/components/Navbar.tsx
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Navbar() {
  const supabase = supabaseBrowser();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // hydrate session + seller flag
  useEffect(() => {
    const mounted = true;
    (async () => {
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
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("profiles")
          .select("is_seller")
          .eq("id", u.id)
          .maybeSingle()
          .then(({ data }) => setIsSeller(Boolean(data?.is_seller)));
      } else setIsSeller(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

  // active link helper
  const isActive = useMemo(() => {
    return (href: string) => pathname === href || pathname?.startsWith(href + "/");
  }, [pathname]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.replace("/");
  }

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // naive GET search to /?q=
    const url = q ? `/?q=${encodeURIComponent(q)}#catalog` : "/#catalog";
    setOpen(false);
    router.push(url);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Left: brand + primary nav */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile: menu toggle */}
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Mobile: quick login always visible */}
          {!user && (
            <Link
              href="/auth/sign-in"
              className="md:hidden rounded-lg border border-slate-200 px-3 py-1 text-sm"
            >
              Login
            </Link>
          )}

          {/* Brand */}
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand-600">Printsy</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className={`transition hover:text-brand-600 ${isActive("/") ? "text-brand-700" : ""}`}
            >
              Home
            </Link>

            {/* Seller link logic */}
            {user && !isSeller && (
              <Link
                href="/seller/onboarding"
                className={`transition hover:text-brand-600 ${isActive("/seller/onboarding") ? "text-brand-700" : ""}`}
              >
                Become a Seller
              </Link>
            )}
            {isSeller && (
              <Link
                href="/seller"
                className={`transition hover:text-brand-600 ${isActive("/seller") ? "text-brand-700" : ""}`}
              >
                Seller
              </Link>
            )}

            {/* Admin gated by env */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`transition hover:text-brand-600 ${isActive("/admin") ? "text-brand-700" : ""}`}
              >
                Admin
              </Link>
            )}

            {/* Profile visible only when logged in */}
            {user && (
              <Link
                href="/profile"
                className={`transition hover:text-brand-600 ${isActive("/profile") ? "text-brand-700" : ""}`}
              >
                Profile
              </Link>
            )}
          </nav>
        </div>

        {/* Right: search + auth controls (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={submitSearch} className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search designs..."
              aria-label="Search designs"
              className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:border-slate-300"
              aria-label="Submit search"
            >
              Search
            </button>
          </form>

          {user ? (
            <>
              <span className="hidden lg:inline text-sm text-slate-700">Hi, {user.email}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button>Login</Button>
              </Link>
              <Link href="/auth/sign-up" className="hidden lg:block">
                <Button variant="outline">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <form onSubmit={submitSearch} className="mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search designs..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
              />
            </form>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <Link href="/" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                Home
              </Link>

              {user && !isSeller && (
                <Link href="/seller/onboarding" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Become a Seller
                </Link>
              )}
              {isSeller && (
                <Link href="/seller" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Seller
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              {user && (
                <Link href="/profile" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Profile
                </Link>
              )}

              <div className="mt-3 flex gap-2">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/sign-in" className="w-1/2" onClick={() => setOpen(false)}>
                      <Button className="w-full">Login</Button>
                    </Link>
                    <Link href="/auth/sign-up" className="w-1/2" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
