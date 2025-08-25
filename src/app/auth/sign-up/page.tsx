"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);

    const form = new FormData(e.currentTarget);
    const values = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setAlert({ type: "error", text: parsed.error.issues[0]?.message || "Invalid inputs." });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);

    if (error) {
      setAlert({ type: "error", text: error.message });
      return;
    }

    // If email confirmations are ON: no session yet → tell them to verify
    if (!data.session) {
      setAlert({
        type: "success",
        text: "Account created. Check your email to verify, then sign in.",
      });
    } else {
      // If confirmations are OFF: you'll have a session → optional redirect
      setAlert({ type: "success", text: "Signed up. Redirecting..." });
      // router.replace("/seller"); // uncomment if you disabled confirmations for dev
    }
  }

  return (
    <AuthFrame
      title="Create your account"
      description="Start selling your designs in minutes."
      footer={
        <span className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {alert && (
          <div
            role="alert"
            className={`rounded-lg border px-3 py-2 text-sm ${
              alert.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {alert.text}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
