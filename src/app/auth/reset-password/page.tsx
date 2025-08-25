"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import AuthFrame from "@/components/AuthFrame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // When arriving from the email link, Supabase fires a PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setCanReset(true);
    });
    // If the session already exists (sometimes Supabase sets it immediately)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCanReset(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);

    if (!canReset) {
      setAlert({
        type: "error",
        text: "Recovery session not found. Click the link from your email again.",
      });
      return;
    }

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const parsed = schema.safeParse({ password });
    if (!parsed.success) {
      setAlert({ type: "error", text: parsed.error.issues[0]?.message || "Invalid password." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);

    if (error) setAlert({ type: "error", text: error.message });
    else {
      setAlert({ type: "success", text: "Password updated. Redirecting to sign in..." });
      setTimeout(() => router.replace("/auth/sign-in"), 1200);
    }
  }

  return (
    <AuthFrame
      title="Reset password"
      description="Enter your new password."
      footer={
        <span className="text-sm text-slate-600">
          Done already?{" "}
          <Link href="/auth/sign-in" className="text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {alert && (
          <div
            role="alert"
            className={`rounded-lg border px-3 py-2 text-sm ${
              alert.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {alert.text}
          </div>
        )}

        {!canReset ? (
          <p className="text-sm text-slate-600">
            Waiting for a valid recovery session… open the link from your email again if this
            doesn’t switch within a few seconds.
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading || !canReset} className="w-full">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
