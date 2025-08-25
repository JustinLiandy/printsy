import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // You can choose a smarter redirect if you want
  return NextResponse.redirect(new URL("/profile", base));
}
