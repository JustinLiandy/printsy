"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" }, mode: "onTouched" });

  async function onSubmit(values: Values) {
    setAlert(null);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
    });
    if (error) setAlert({ type: "error", text: error.message });
    else setAlert({ type: "success", text: "Reset email sent. Check your inbox." });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>We’ll email you a reset link faster than your coffee gets cold.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {alert && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${alert.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
                  {alert.text}
                </div>
              )}

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-xs text-slate-600">
            Remembered it? <Link className="text-brand-600 underline" href="/auth/sign-in">Back to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
