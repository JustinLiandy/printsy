"use client";

import { useState } from "react";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const SITE = process.env.NEXT_PUBLIC_SITE_URL!;

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function onSend() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE}/auth/reset-password`
    });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "Reset email sent. Check your inbox." });
    setBusy(false);
  }

  return (
    <AuthFrame title="Forgot password" subtitle="We’ll email you a secure reset link.">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        {msg && (
          <div className={`rounded-md px-3 py-2 text-sm ${msg.type === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {msg.text}
          </div>
        )}
        <Button className="w-full" disabled={busy} onClick={onSend}>
          {busy ? "Sending..." : "Send reset link"}
        </Button>
      </div>
    </AuthFrame>
  );
}
