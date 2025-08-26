// src/components/NavbarServer.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import NavbarClient from "./NavbarClient";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

export default async function NavbarServer() {
  // Force a new RSC render on navigation so auth state stays fresh
  // (headers() touch prevents static optimization)
  headers();

  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();

  let isSeller = false;
  let shopSlug: string | null = null;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_seller, shop_slug")
      .eq("id", user.id)
      .single();
    isSeller = Boolean(profile?.is_seller);
    shopSlug = profile?.shop_slug ?? null;
  }

  const isAdmin = !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;

  return (
    <NavbarClient
      isAuthed={!!user}
      userEmail={user?.email ?? null}
      isSeller={isSeller}
      shopSlug={shopSlug}
      isAdmin={isAdmin}
    />
  );
}
