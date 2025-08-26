"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

type ProfileMini = {
  is_seller: boolean | null;
  shop_slug: string | null;
};

export default function Navbar() {
  const supabase = supabaseBrowser();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileMini | null>(null);
  const [open, setOpen] = useState(false);

  // Load user & subscribe to auth changes
  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch minimal profile flags
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_seller,shop_slug")
        .eq("id", user.id)
        .single();

      if (!cancelled) setProfile(data ?? { is_seller: false, shop_slug: null });
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, user?.id]);

  const isAdmin = useMemo(
    () => !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL,
    [user?.email]
  );

  const doLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.assign("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-3 md:gap-8">
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand-600">Printsy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/" className={linkCls(pathname === "/")}>Home</Link>

            {/* Seller entry point (depends on profile) */}
            {profile?.is_seller ? (
              <Link href="/seller" className={linkCls(pathname?.startsWith("/seller"))}>
                Seller
              </Link>
            ) : (
              <Link
                href={user ? "/seller/onboarding" : "/auth/sign-in?next=%2Fseller%2Fonboarding"}
                className={linkCls(pathname?.startsWith("/seller"))}
              >
                Become a Seller
              </Link>
            )}

            {/* Admin gate */}
            {isAdmin && (
              <Link href="/admin" className={linkCls(pathname?.startsWith("/admin"))}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: search + auth */}
        <div className="hidden md:flex items-center gap-3">
          <input
            placeholder="Search designs..."
            className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
            defaultValue=""
          />

          {!user ? (
            <>
              <Link href="/auth/sign-in">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline">Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              <span className="hidden lg:inline text-sm text-slate-700">Hi, {user.email}</span>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button onClick={doLogout} variant="destructive">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="mb-3">
              <input
                placeholder="Search designs..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
              />
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              <Link href="/" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                Home
              </Link>

              {profile?.is_seller ? (
                <Link href="/seller" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Seller
                </Link>
              ) : (
                <Link
                  href={user ? "/seller/onboarding" : "/auth/sign-in?next=%2Fseller%2Fonboarding"}
                  className="rounded-lg px-2 py-2 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Become a Seller
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                {!user ? (
                  <>
                    <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="outline">Sign in</Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="outline">Sign up</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="outline">Profile</Button>
                    </Link>
                    <Button onClick={doLogout} className="w-full" variant="destructive">
                      Logout
                    </Button>
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

function linkCls(active?: boolean) {
  return ["transition", active ? "text-brand-600" : "text-slate-700 hover:text-brand-600"].join(" ");
}
