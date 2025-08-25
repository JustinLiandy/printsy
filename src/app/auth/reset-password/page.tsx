"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ password: z.string().min(6, "At least 6 characters") });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const query = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const code = query.get("code");
    const type = query.get("type");
    if (!code || type !== "recovery") {
      setAlert({ type: "error", text: "Invalid or expired reset link." });
      setReady(true);
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setAlert({ type: "error", text: error.message });
      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "" }, mode: "onTouched" });

  async function onSubmit(values: Values) {
    setAlert(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) return setAlert({ type: "error", text: error.message });
    setAlert({ type: "success", text: "Password updated. Redirecting..." });
    setTimeout(() => router.replace("/auth/sign-in"), 800);
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>Give your account a fresh lock. Preferably one you’ll remember.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-slate-600">Validating your link...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField name="password" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {alert && (
                  <div className={`rounded-lg border px-3 py-2 text-sm ${alert.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
                    {alert.text}
                  </div>
                )}

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
