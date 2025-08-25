// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // You can verify the token via @supabase/ssr if you want.
  // For now, send users to sign-in, where a valid, verified email can log in.
  return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
