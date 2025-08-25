"use client";

import * as React from "react";
import { z } from "zod";
import AuthFrame from "@/components/AuthFrame";
import { InlineAlert } from "@/components/InlineAlert";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      setMsg({ kind: "error", text: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setBusy(false);

    if (error) {
      setMsg({
        kind: "error",
        text:
          error.message ||
          "Session missing. Open the reset link from your email again.",
      });
      return;
    }

    setMsg({ kind: "success", text: "Password updated. You can sign in now." });
  }

  return (
    <AuthFrame
      title="Reset password"
      subtitle="Choose a new password."
      footer={
        <>
          Done already?{" "}
          <a className="font-medium text-brand-600 hover:underline" href="/auth/sign-in">
            Back to sign in
          </a>
        </>
      }
    >
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpw">Confirm new password</Label>
          <Input id="cpw" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>

        <Button type="submit" disabled={busy} className="w-full text-white">
          {busy ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
