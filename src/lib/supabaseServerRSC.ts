// src/lib/supabaseServerRSC.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server Component-safe Supabase client (Next 15).
 */
export async function supabaseServerRSC() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Map Next's { name, value } objects to what Supabase expects
          return store.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // RSC cannot mutate outgoing cookies; but “touch” the arg so ESLint is happy.
          if (cookiesToSet.length > 0) {
            // no-op
          }
        },
      },
    }
  );
}