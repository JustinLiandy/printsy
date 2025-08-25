"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import  AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInPage() {
  const router = useRouter();
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
      setAlert({ type: "error", text: "Please enter a valid email and password." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (error) {
      setAlert({ type: "error", text: error.message });
      return;
    }
    router.replace("/seller");
  }

  async function signInWithMagic(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setAlert(null);

    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    if (!emailInput?.value) {
      setAlert({ type: "error", text: "Enter your email first, then use magic link." });
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput.value,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setAlert({ type: "error", text: error.message });
    else setAlert({ type: "success", text: "Magic link sent. Check your email." });
  }

  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to manage your designs and orders."
      footer={
        <>
          <span className="text-sm text-slate-600">
            No account?{" "}
            <Link className="text-brand-600 hover:underline" href="/auth/sign-up">
              Sign up
            </Link>
          </span>
          <Link className="text-sm text-slate-600 hover:underline" href="/auth/forgot-password">
            Forgot password?
          </Link>
        </>
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

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Button type="button" variant="outline" onClick={signInWithMagic}>
            Send magic link
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
