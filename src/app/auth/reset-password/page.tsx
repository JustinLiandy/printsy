"use client";

import { useEffect, useState } from "react";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{type:"error"|"success";text:string}|null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // When opened from email, the URL contains a session; the client picks it up automatically
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
      if (!data.session) {
        setAlert({ type:"error", text:"Open this page from the email link to continue." });
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password")||"");

    try {
      setPending(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setAlert({ type:"success", text:"Password updated. You can now sign in." });
    } catch (err:any) {
      setAlert({ type:"error", text: err.message ?? "Failed to update password" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title="Choose a new password">
      {alert && (
        <div className={alert.type==="error" ? "mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" : "mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700"}>
          {alert.text}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={6} required />
        </div>
        <Button type="submit" disabled={pending || !ready} className="w-full">
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
