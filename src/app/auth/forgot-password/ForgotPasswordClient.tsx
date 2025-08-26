"use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/InlineAlert";

export default function ForgotPasswordClient() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);
    setBusy(true);

    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") +
      "/auth/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo, // NOTE: correct key for @supabase/supabase-js v2
    });

    setBusy(false);

    if (error) {
      setMsg({ kind: "error", text: error.message });
      return;
    }
    setMsg({ kind: "success", text: "Check your email for the reset link." });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={busy} variant="outline">
        {busy ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
