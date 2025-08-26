// src/components/NavbarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = {
  isAuthed: boolean;
  userEmail: string | null;
  isSeller: boolean;
  shopSlug: string | null;
  isAdmin: boolean;
};

export default function NavbarClient({
  isAuthed,
  userEmail,
  isSeller,
  shopSlug,
  isAdmin,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const supabase = useMemo(() => supabaseBrowser(), []);

  async function doLogout() {
    await supabase.auth.signOut();
    // nuke any client cache and land on home
    window.location.assign("/");
  }

  const linkCls = (active?: boolean) =>
    ["transition", active ? "text-brand-600" : "text-slate-700 hover:text-brand-600"].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-3 md:gap-8">
          <button
            className="md:hidden rounded-lg border border-slate-200 p-2"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-brand-600">Printsy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={linkCls(pathname === "/")}>Home</Link>

            {isSeller ? (
              <Link href="/seller" className={linkCls(pathname?.startsWith("/seller"))}>
                Seller
              </Link>
            ) : (
              <Link href="/seller/onboarding" className={linkCls(pathname?.startsWith("/seller"))}>
                Become a seller
              </Link>
            )}

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
            aria-label="Search"
          />

          {!isAuthed ? (
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
              <span className="hidden lg:inline text-sm text-slate-700">
                Hi, {userEmail}
              </span>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button onClick={doLogout} variant="destructive">Logout</Button>
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
                aria-label="Search"
              />
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-800">
              <Link href="/" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                Home
              </Link>

              {isSeller ? (
                <Link href="/seller" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Seller
                </Link>
              ) : (
                <Link href="/seller/onboarding" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Become a seller
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                {!isAuthed ? (
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
