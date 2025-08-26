// src/lib/supabaseBrowser.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Browser-first Supabase client.
 * - On the server (during prerender), returns a safe, no-persist client.
 * - On the browser, returns a cached client with default auth persistence.
 */
export function supabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (typeof window === "undefined") {
    // Server-safe fallback (no DOM, no localStorage)
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          getItem: (_k: string) => null,
          setItem: (_k: string, _v: string) => {},
          removeItem: (_k: string) => {},
          /* eslint-enable @typescript-eslint/no-unused-vars */
        },
      },
    });
  }

  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}