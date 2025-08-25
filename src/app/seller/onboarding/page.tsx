"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Popular Indonesian banks and wallets (suggestions only)
const PAYOUT_SUGGESTIONS = [
  "BCA", "Mandiri", "BNI", "BRI", "SeaBank",
  "GoPay", "OVO", "Dana", "ShopeePay", "CIMB Niaga", "Permata", "Jago", "LinkAja"
];

const schema = z.object({
  shop_name: z.string().min(3, "Shop name must be at least 3 characters"),
  payout_type: z.string().min(2, "Enter bank or e-wallet name"),
  payout_name: z.string().min(2, "Account holder name is required"),
  payout_account: z.string().min(4, "Enter your account number or e-wallet ID"),
  tax_id: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function SellerOnboardingPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      shop_name: "",
      payout_type: "",
      payout_name: "",
      payout_account: "",
      tax_id: "",
    },
  });

  async function onSubmit(values: Values) {
    setAlert(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAlert({ type: "error", text: "You must be logged in." });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, ...values, is_seller: true, email: user.email || null },
        { onConflict: "id" }
      );

    if (error) {
      setAlert({ type: "error", text: error.message });
      return;
    }

    setAlert({ type: "success", text: "Onboarding complete! Redirecting…" });
    setTimeout(() => router.push("/seller"), 900);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>Fill out your shop and payout details.</CardDescription>
        </CardHeader>
        <CardContent>
          {alert && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              alert.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>{alert.text}</div>
          )}

          {/* Datalist for payout suggestions */}
          <datalist id="payout-suggestions">
            {PAYOUT_SUGGESTIONS.map(opt => <option key={opt} value={opt} />)}
          </datalist>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="shop_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop name</FormLabel>
                  <FormControl><Input placeholder="Your shop name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank / E‑wallet</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      list="payout-suggestions"
                      placeholder="e.g. BCA, Mandiri, GoPay, OVO..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Account holder</FormLabel>
                  <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_account" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Account number / ID</FormLabel>
                  <FormControl><Input placeholder="e.g. 1234567890" {...field} /></FormControl>
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

              <Button type="submit" className="w-full">
                Submit & Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
