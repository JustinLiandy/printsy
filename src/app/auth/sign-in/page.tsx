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
  password: z.string().min(6),
});

export default function SignInPage() {
  const supabase = supabaseBrowser();
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"password" | "magic">("password");
  const [alert, setAlert] = useState<{type:"error"|"success";text:string}|null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    const form = new FormData(e.currentTarget);
    const values = { email: String(form.get("email")||""), password: String(form.get("password")||"") };

    try {
      setPending(true);
      if (tab === "password") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) throw error;
        window.location.href = "/";
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
        });
        if (error) throw error;
        setAlert({ type:"success", text:"Magic link sent. Check your email." });
      }
    } catch (err:any) {
      setAlert({ type:"error", text: err.message ?? "Sign in failed" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Use password or magic link. We’ll keep it simple."
    >
      <div className="mb-4 flex gap-2">
        <Button variant={tab==="password" ? "default" : "outline"} onClick={()=>setTab("password")}>Password</Button>
        <Button variant={tab==="magic" ? "default" : "outline"} onClick={()=>setTab("magic")}>Magic link</Button>
      </div>

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

        {tab === "password" && (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link className="text-sm text-brand-600 hover:underline" href="/auth/forgot-password">Forgot password?</Link>
          <Link className="text-sm text-slate-600 hover:underline" href="/auth/sign-up">Create account</Link>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : tab==="password" ? "Sign in" : "Send magic link"}
        </Button>
      </form>
    </AuthFrame>
  );
}
