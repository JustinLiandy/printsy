"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const schema = z.object({
  shop_name: z.string().min(3, "Shop name must be at least 3 characters"),
  payout_type: z.enum(["bank", "ewallet"]),
  payout_name: z.string().min(2, "Account holder name is required"),
  payout_account: z.string().min(4, "Enter your bank number or e-wallet ID"),
  tax_id: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function SellerOnboardingPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      shop_name: "",
      payout_type: "bank",
      payout_name: "",
      payout_account: "",
      tax_id: "",
    },
  });

  async function onSubmit(values: Values) {
    setAlert(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return setAlert({ type: "error", text: "You must be logged in." });
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...values, is_seller: true }, { onConflict: "id" });

    if (error) {
      setAlert({ type: "error", text: error.message });
    } else {
      setAlert({ type: "success", text: "Welcome aboard! Redirecting…" });
      setTimeout(() => router.push("/seller"), 800); // <--- redirect
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>Fill out your shop and payout details. One step closer to selling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="shop_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop name</FormLabel>
                  <FormControl><Input placeholder="My Cool Shop" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Payout type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank">Bank transfer</SelectItem>
                      <SelectItem value="ewallet">E-wallet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Account holder</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_account" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Account number / ID</FormLabel>
                  <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="tax_id" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID (optional)</FormLabel>
                  <FormControl><Input placeholder="NPWP or leave blank" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {alert && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${
                  alert.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}>
                  {alert.text}
                </div>
              )}

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting…" : "Submit and continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
