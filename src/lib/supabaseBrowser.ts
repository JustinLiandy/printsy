// src/lib/supabaseBrowser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function supabaseBrowser() {
  // If running on the server, just return a harmless dummy object
  if (typeof window === "undefined") {
    console.warn("supabaseBrowser() called on the server – returning dummy client.");
    return {} as SupabaseClient;
  }

  // Singleton: reuse same client across renders
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}