"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Min 6 characters"),
});

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{type:"error"|"success";text:string}|null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    const f = new FormData(e.currentTarget);
    const values = schema.parse({
      email: String(f.get("email")||""),
      password: String(f.get("password")||""),
    });

    try {
      setPending(true);
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
      });
      if (error) throw error;
      setAlert({ type:"success", text:"Check your email to verify, then sign in." });
    } catch (err:any) {
      setAlert({ type:"error", text: err.message ?? "Sign up failed" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title="Create account">
      {alert && (
        <div className={alert.type==="error" ? "mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" : "mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700"}>
          {alert.text}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating…" : "Create account"}
        </Button>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account? <Link className="text-brand-600 hover:underline" href="/auth/sign-in">Sign in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
