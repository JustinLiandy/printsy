// src/lib/supabaseServerRSC.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServerRSC() {
  const cookieStore = await cookies(); // Next 15: cookies() is async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // RSC can't mutate cookies; no-ops keep the API happy
        set() {},
        remove() {},
      },
    }
  );
}
