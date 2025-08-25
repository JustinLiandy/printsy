// src/lib/supabaseServerRSC.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server Component-safe Supabase client.
 * Next 15: cookies() is async in RSC, and @supabase/ssr wants getAll/setAll.
 * We return a client you can use inside server components and actions.
 */
export async function supabaseServerRSC() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // map Next's {name,value} into what Supabase expects
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // RSC cannot mutate response cookies; this is intentionally a no-op.
          // Touch the arg to silence ESLint:
          if (cookiesToSet.length > 0) {
            // noop
          }
        },
      },
    }
  );

  return supabase;
}
