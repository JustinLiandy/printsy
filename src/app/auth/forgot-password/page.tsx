"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setAlert({ type: "error", text: "Enter a valid email." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    setLoading(false);

    if (error) setAlert({ type: "error", text: error.message });
    else setAlert({ type: "success", text: "Reset link sent. Check your email." });
  }

  return (
    <AuthFrame
      title="Forgot password"
      description="We’ll send a secure link to reset it."
      footer={
        <span className="text-sm text-slate-600">
          Remember it?{" "}
          <Link href="/auth/sign-in" className="text-brand-600 hover:underline">
            Back to sign in
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

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
