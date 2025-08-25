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

const SUGGESTIONS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "SeaBank",
  "CIMB Niaga",
  "Permata",
  "Jago",
  "GoPay",
  "OVO",
  "Dana",
  "ShopeePay",
  "LinkAja",
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("You must be logged in.");

      // Upsert profile and mark user as seller
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email || null,
            is_seller: true,
            shop_name: values.shop_name,
            payout_type: values.payout_type,
            payout_name: values.payout_name,
            payout_account: values.payout_account,
            tax_id: values.tax_id || null,
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      setAlert({ type: "success", text: "Onboarding complete. Redirecting..." });
      // Go directly to Seller dashboard
      router.replace("/seller");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setAlert({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
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
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                alert.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {alert.text}
            </div>
          )}

          {/* Suggestions list for bank/e-wallet; still allows free text */}
          <datalist id="payout-suggestions">
            {SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="shop_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your shop name" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="payout_type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank / E‑wallet</FormLabel>
                    <FormControl>
                      <Input
                        list="payout-suggestions"
                        placeholder="e.g. BCA, Mandiri, GoPay, OVO..."
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="payout_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account holder</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="payout_account"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account number / ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234567890" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="tax_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="NPWP or leave blank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brand-600 text-white hover:bg-brand-700"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Submitting..." : "Submit & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
