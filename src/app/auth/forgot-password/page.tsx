"use client";

import { useState } from "react";
import { z } from "zod";
import AuthFrame from "@/components/AuthFrame";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{type:"error"|"success";text:string}|null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    const f = new FormData(e.currentTarget);
    const { email } = schema.parse({ email: String(f.get("email")||"") });

    try {
      setPending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });
      if (error) throw error;
      setAlert({ type:"success", text:"Password reset email sent." });
    } catch (err:any) {
      setAlert({ type:"error", text: err.message ?? "Failed to send reset" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame title="Reset your password" subtitle="We’ll email you a secure link.">
      {alert && (
        <div className={alert.type==="error" ? "mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" : "mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700"}>
          {alert.text}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthFrame>
  );
}
