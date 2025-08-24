// src/app/auth/sign-in/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Values = z.infer<typeof schema>;

export default function SignInPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [mode, setMode] = useState<"password"|"magic">("password");
  const [alert, setAlert] = useState<{ type: "error"|"success"; text: string } | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: Values) {
    setAlert(null);
    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) return setAlert({ type: "error", text: error.message });
      router.replace("/"); // or /profile
      return;
    }
    // magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) setAlert({ type: "error", text: error.message });
    else setAlert({ type: "success", text: "Magic link sent. Check your email." });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Welcome back. Choose password or magic link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2 text-xs">
            <button
              className={`rounded-full border px-3 py-1 ${mode === "password" ? "border-brand-300 text-brand-700" : "border-slate-300 text-slate-600"}`}
              onClick={() => setMode("password")}
            >
              Password
            </button>
            <button
              className={`rounded-full border px-3 py-1 ${mode === "magic" ? "border-brand-300 text-brand-700" : "border-slate-300 text-slate-600"}`}
              onClick={() => setMode("magic")}
            >
              Magic link
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === "password" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <div className="mt-1 text-xs">
                        <a href="/auth/forgot-password" className="text-brand-600 underline">Forgot password?</a>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {alert && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${
                  alert.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
                }`}>{alert.text}</div>
              )}
              <Button type="submit" className="bg-brand-600 text-white hover:bg-brand-700" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : mode === "password" ? "Sign in" : "Send magic link"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-xs text-slate-600">
            Don’t have an account? <a className="text-brand-600 underline" href="/auth/sign-up">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
