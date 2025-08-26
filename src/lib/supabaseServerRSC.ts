// src/lib/supabaseServerRSC.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server Component–safe Supabase client for Next 15.
 * Uses cookies().getAll() and a no-op setAll (RSC can’t mutate response cookies).
 */
export async function supabaseServerRSC() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // RSC cannot set outgoing cookies; touching the array keeps ESLint happy.
          if (cookiesToSet && cookiesToSet.length > 0) {
            // no-op
          }
        },
      },
    }
  );
}