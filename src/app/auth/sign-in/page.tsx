"use client";

import { useState } from "react";
import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const SITE = process.env.NEXT_PUBLIC_SITE_URL!;

export default function SignInPage() {
  const supabase = supabaseBrowser();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function doPassword() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "Signed in. Redirecting..." });
    setBusy(false);
  }

  async function doMagic() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE}/auth/callback` }
    });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "Magic link sent. Check your email." });
    setBusy(false);
  }

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Use password or magic link. We’re flexible, like your schedule."
    >
      <div className="mb-4 flex gap-2">
        <Button type="button" variant={mode === "password" ? "default" : "outline"} onClick={() => setMode("password")}>
          Password
        </Button>
        <Button type="button" variant={mode === "magic" ? "default" : "outline"} onClick={() => setMode("magic")}>
          Magic link
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        {mode === "password" && (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="mt-2 text-sm">
              <Link className="text-brand-600 hover:underline" href="/auth/forgot-password">Forgot password?</Link>
            </div>
          </div>
        )}

        {msg && (
          <div className={`rounded-md px-3 py-2 text-sm ${msg.type === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {msg.text}
          </div>
        )}

        <Button className="w-full" disabled={busy} onClick={mode === "password" ? doPassword : doMagic}>
          {busy ? "Working..." : mode === "password" ? "Sign in" : "Send magic link"}
        </Button>

        <p className="text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link className="text-brand-600 hover:underline" href="/auth/sign-up">Sign up</Link>
        </p>
      </div>
    </AuthFrame>
  );
}
