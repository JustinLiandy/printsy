// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // Prepare redirect response (we'll attach cookies to this)
  const res = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // read all cookies from request
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        // write all cookies onto the response
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errURL = new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, url.origin);
      return NextResponse.redirect(errURL);
    }

    // Ensure a profile row exists (id/email only; rest you can fill later)
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email ?? null },
          { onConflict: "id" }
        );
    }
  }

  return res;
}
