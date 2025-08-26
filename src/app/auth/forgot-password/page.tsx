"use client";

import * as React from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    if (!email) return setMsg({ kind: "error", text: "Enter your email." });

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // IMPORTANT: for v2 this prop is `redirectTo`
      redirectTo: `${SITE}/auth/callback`,
    });
    setBusy(false);

    if (error) return setMsg({ kind: "error", text: error.message });
    setMsg({ kind: "success", text: "Reset email sent. Check your inbox." });
  }

  return (
    <AuthFrame
      title="Forgot password"
      subtitle="We’ll email you a secure reset link."
      footer={
        <>
          Remember it?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/auth/sign-in">
            Back to sign in
          </Link>
        </>
      }
    >
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <Button type="submit" disabled={busy} variant="outline" className="w-full">
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthFrame>
  );
}
