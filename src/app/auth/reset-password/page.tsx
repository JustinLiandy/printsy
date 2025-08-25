"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [ready, setReady] = useState(false);

  // Supabase will set a "type=recovery" and a session via cookies after the link
  useEffect(() => {
    const type = params.get("type");
    setReady(type === "recovery" || true); // be lenient; supabase-js handles missing session with an error
  }, [params]);

  async function onReset() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg({ type: "error", text: error.message });
    else {
      setMsg({ type: "success", text: "Password updated. Redirecting to sign in..." });
      setTimeout(() => router.push("/auth/sign-in"), 1200);
    }
    setBusy(false);
  }

  return (
    <AuthFrame title="Set a new password" subtitle="Make it strong, not guessable.">
      <div className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {msg && (
          <div className={`rounded-md px-3 py-2 text-sm ${msg.type === "error" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {msg.text}
          </div>
        )}
        <Button className="w-full" disabled={busy || !ready} onClick={onReset}>
          {busy ? "Updating..." : "Update password"}
        </Button>
      </div>
    </AuthFrame>
  );
}
