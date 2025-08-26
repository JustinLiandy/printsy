"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// small inline alert helper
function InlineAlert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      className={[
        "mb-4 rounded-lg border px-3 py-2 text-sm",
        kind === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const magicSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [mode, setMode] = React.useState<"password" | "magic">("password");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  React.useEffect(() => {
    const m = sp.get("mode");
    if (m === "magic") setMode("magic");
  }, [sp]);

  const supabase = supabaseBrowser();
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  async function signInPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    const parsed = passwordSchema.safeParse({ email, password });
    if (!parsed.success) {
      setMsg({ kind: "error", text: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);

    if (error) return setMsg({ kind: "error", text: error.message });

    router.push("/");
    router.refresh();
  }

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    const parsed = magicSchema.safeParse({ email });
    if (!parsed.success) {
      setMsg({ kind: "error", text: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        // IMPORTANT: points to our server callback
        emailRedirectTo: `${SITE}/auth/callback`,
      },
    });
    setBusy(false);

    if (error) return setMsg({ kind: "error", text: error.message });
    setMsg({ kind: "success", text: "Magic link sent. Check your inbox." });
  }

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Use your password or a magic link."
      footer={
        <>
          Don’t have an account?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/auth/sign-up">
            Sign up
          </Link>
        </>
      }
    >
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`rounded-full border px-3 py-1 text-sm ${
            mode === "password" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`rounded-full border px-3 py-1 text-sm ${
            mode === "magic" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"
          }`}
        >
          Magic link
        </button>
      </div>

      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      {mode === "password" ? (
        <form onSubmit={signInPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <Link className="text-sm text-brand-600 hover:underline" href="/auth/forgot-password">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={busy} variant="outline" className="w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input id="magic-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" variant="outline" disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send magic link"}
          </Button>
        </form>
      )}
    </AuthFrame>
  );
}
