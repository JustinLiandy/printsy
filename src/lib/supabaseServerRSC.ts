// read-only server client for RSC (Next 15 cookies() is async)
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServerRSC() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},       // no-ops in RSC
        remove() {},
      },
    }
  );
}
