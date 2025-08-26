"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80).optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  const [form, setForm] = React.useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setMsg({ kind: "error", text: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${SITE}/auth/callback`,
        data: { full_name: parsed.data.full_name ?? "" },
      },
    });
    setBusy(false);

    if (error) return setMsg({ kind: "error", text: error.message });

    // Optional: try to upsert profile (ignore failures; RLS might require a trigger instead)
// after a successful signUp
const userId = data.user?.id;

if (userId) {
  const { error: upErr } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: parsed.data.email,
        full_name: parsed.data.full_name ?? "",
        is_seller: false,
      },
      { onConflict: "id" } // if row exists, update; otherwise insert
    );

  // Optional: handle/log upErr if you want
  // if (upErr) console.error(upErr);
}

    setMsg({
      kind: "success",
      text: "Account created. Check your email to confirm, then sign in.",
    });
  }

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Start selling your designs in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/auth/sign-in">
            Sign in
          </Link>
        </>
      }
    >
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name (optional)</Label>
          <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <Button type="submit" disabled={busy} variant="outline" className="w-full">
          {busy ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthFrame>
  );
}
