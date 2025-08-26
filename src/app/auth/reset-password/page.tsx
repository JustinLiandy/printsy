"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const sp = useSearchParams();
  const code = sp.get("code"); // might be present if you deep-linked here

  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "error" | "success"; text: string }>();

  // Optional robustness: if someone arrives with ?code= but no session,
  // try to complete the session on the client (normally handled in /auth/callback).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user && code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
        if (!cancelled) router.refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router, supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(undefined);

    if (pw1.length < 6) return setMsg({ kind: "error", text: "Password must be at least 6 characters." });
    if (pw1 !== pw2) return setMsg({ kind: "error", text: "Passwords do not match." });

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);

    if (error) return setMsg({ kind: "error", text: error.message });

    setMsg({ kind: "success", text: "Password updated. You can now sign in." });
    setTimeout(() => {
      router.push("/auth/sign-in");
      router.refresh();
    }, 900);
  }

  return (
    <AuthFrame
      title="Reset password"
      subtitle="Choose a new password for your account."
      footer={
        <>
          Changed your mind?{" "}
          <Link className="font-medium text-brand-600 hover:underline" href="/auth/sign-in">
            Back to sign in
          </Link>
        </>
      }
    >
      {msg ? <InlineAlert kind={msg.kind}>{msg.text}</InlineAlert> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pw1">New password</Label>
          <Input id="pw1" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">Confirm password</Label>
          <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>

        <Button type="submit" disabled={busy} variant="outline" className="w-full">
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
