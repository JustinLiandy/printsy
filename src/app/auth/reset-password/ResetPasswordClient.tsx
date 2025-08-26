"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { InlineAlert } from "@/components/InlineAlert";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [pwd, setPwd] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();
  const [hasSession, setHasSession] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    if (!hasSession) {
      setMsg({ kind: "error", text: "Reset link is invalid or expired. Request a new one." });
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);

    if (error) {
      setMsg({ kind: "error", text: error.message });
      return;
    }

    setMsg({ kind: "success", text: "Password updated. Redirecting to sign in…" });
    setTimeout(() => {
      router.replace("/auth/sign-in");
      router.refresh();
    }, 900);
  }

  return (
    <AuthFrame title="Reset password" subtitle="Choose a new password.">
      {hasSession === false && (
        <InlineAlert kind="error">Reset link invalid/expired. Go back to “Forgot password”.</InlineAlert>
      )}
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pwd">New password</Label>
          <Input
            id="pwd"
            type="password"
            placeholder="••••••••"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={busy || hasSession === false} variant="outline" className="w-full">
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
