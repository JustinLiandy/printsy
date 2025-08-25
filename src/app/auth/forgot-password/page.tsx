"use client";

import * as React from "react";
import { z } from "zod";
import AuthFrame from "@/components/AuthFrame";
import { InlineAlert } from "@/components/InlineAlert";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setMsg({ kind: "error", text: parsed.error.issues[0]?.message ?? "Invalid email" });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL ?? "") + "/auth/reset-password",
    });
    setBusy(false);

    if (error) {
      setMsg({ kind: "error", text: error.message });
      return;
    }
    setMsg({
      kind: "success",
      text: "Reset email sent. Check your inbox and follow the link.",
    });
  }

  return (
    <AuthFrame
      title="Forgot password"
      subtitle="We’ll email you a reset link."
      footer={
        <>
          Remember it?{" "}
          <a className="font-medium text-brand-600 hover:underline" href="/auth/sign-in">
            Back to sign in
          </a>
        </>
      }
    >
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <Button type="submit" disabled={busy} className="w-full text-white">
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthFrame>
  );
}
