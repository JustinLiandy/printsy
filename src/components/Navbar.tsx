"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();

type ProfileMini = {
  is_seller: boolean | null;
  shop_slug: string | null;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Create browser client ONLY on the client.
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<ProfileMini | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAdmin = !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;

  // Session load + subscription
  React.useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Minimal profile fetch when we have a user
  React.useEffect(() => {
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

  const linkCls = (active?: boolean) =>
    [
      "transition-colors",
      active ? "text-brand-600" : "text-slate-700 hover:text-brand-600",
    ].join(" ");

  const handleSellerClick = () => {
    if (!user) {
      const to = "/seller/onboarding";
      router.push(`/auth/sign-in?next=${encodeURIComponent(to)}`);
      return;
    }
    if (profile?.is_seller) {
      router.push("/seller");
    } else {
      router.push("/seller/onboarding");
    }
  };

  const doLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const goSearch = (formData: FormData) => {
    const q = String(formData.get("q") || "").trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-3 md:gap-8">
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand-600">Printsy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={linkCls(pathname === "/")}>
              Home
            </Link>

            <button
              type="button"
              onClick={handleSellerClick}
              className={linkCls(pathname?.startsWith("/seller"))}
            >
              {profile?.is_seller ? "Seller" : "Become a seller"}
            </button>

            {isAdmin && (
              <Link href="/admin" className={linkCls(pathname?.startsWith("/admin"))}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: search + auth */}
        <div className="hidden md:flex items-center gap-3">
          <form action={goSearch}>
            <input
              name="q"
              placeholder="Search designs…"
              className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
              defaultValue=""
            />
          </form>

          {!user ? (
            <>
              <Link href="/auth/sign-in">
                <Button variant="outline" className="!text-slate-800">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="!text-slate-800">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span className="hidden lg:inline text-sm text-slate-700">
                Hi, {user.email}
              </span>
              <Link href="/profile">
                <Button variant="outline" className="!text-slate-800">
                  Profile
                </Button>
              </Link>
              <Button onClick={doLogout} variant="destructive">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <form action={goSearch} className="mb-3">
              <input
                name="q"
                placeholder="Search designs…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring-2"
              />
            </form>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              <Link
                href="/"
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>

              <button
                onClick={handleSellerClick}
                className="text-left rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                {profile?.is_seller ? "Seller" : "Become a seller"}
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg px-2 py-2 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                {!user ? (
                  <>
                    <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full !text-slate-800" variant="outline">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full !text-slate-800" variant="outline">
                        Sign up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full !text-slate-800" variant="outline">
                        Profile
                      </Button>
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
