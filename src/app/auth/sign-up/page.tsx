// src/app/auth/sign-up/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type Values = z.infer<typeof schema>;

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: "error"|"success"; text: string } | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: Values) {
    setAlert(null);
    // create account
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      }
    });
    if (error) return setAlert({ type: "error", text: error.message });

    // create a profiles row for this user (requires insert policy from step 0)
  const user = data.user;
  if (user?.id) {
  // create-or-update, safe if row already exists
    const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  // ignore profileError for MVP; you can log it if you want
}

    setAlert({ type: "success", text: "Account created. Check your email to verify, then sign in." });
    // optionally: router.replace("/auth/sign-in");
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start selling in minutes.</CardDescription>
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
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {alert && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${
                  alert.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
                }`}>{alert.text}</div>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create account"}
              </Button>

            </form>
          </Form>
          <p className="mt-4 text-xs text-slate-600">
            Already have an account? <a className="text-brand-600 underline" href="/auth/sign-in">Sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
