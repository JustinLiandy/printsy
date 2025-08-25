// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // Prepare redirect response first so we can attach outgoing cookies to it
  const res = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request
        getAll() {
          // NextRequest.cookies.getAll() -> { name, value }[]
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        // Write cookies onto the response
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=callback", url));
    }
  }

  return res;
}