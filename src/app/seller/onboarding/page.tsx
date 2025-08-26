"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { completeOnboarding } from "./actions";

const SUGGESTIONS = ["BCA","Mandiri","BNI","BRI","SeaBank","CIMB Niaga","Permata","Jago","GoPay","OVO","Dana","ShopeePay","LinkAja"];

const schema = z.object({
  shop_name: z.string().min(3, "Shop name must be at least 3 characters"),
  payout_type: z.string().min(2, "Enter bank or e-wallet name"),
  payout_name: z.string().min(2, "Account holder name is required"),
  payout_account: z.string().min(4, "Enter your account number or e-wallet ID"),
  tax_id: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function SellerOnboardingPage() {
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { shop_name:"", payout_type:"", payout_name:"", payout_account:"", tax_id:"" },
  });

  

  function onSubmit(values: Values) {
    setAlert(null);
    startTransition(async () => {
      try {
        // If this succeeds, the server action will redirect to /seller.
        await completeOnboarding(values);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        setAlert({ type: "error", text: msg });
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="shadow-card border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-900">Become a Seller</CardTitle>
          <CardDescription className="text-slate-600">Fill out your shop and payout details.</CardDescription>
        </CardHeader>
        <CardContent>
          {alert && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              alert.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>{alert.text}</div>
          )}

          <datalist id="payout-suggestions">{SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField name="shop_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop name</FormLabel>
                  <FormControl><Input placeholder="Your shop name" required {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="payout_type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank / E‑wallet</FormLabel>
                  <FormControl>
                    <Input list="payout-suggestions" placeholder="e.g. BCA, Mandiri, GoPay, OVO..." required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField name="payout_name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account holder</FormLabel>
                    <FormControl><Input placeholder="e.g. John Doe" required {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="payout_account" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account number / ID</FormLabel>
                    <FormControl><Input placeholder="e.g. 1234567890" required {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="tax_id" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID (optional)</FormLabel>
                  <FormControl><Input placeholder="NPWP or leave blank" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                className="w-full bg-brand-500 text-white hover:bg-brand-600"
                disabled={pending}
                aria-busy={pending}
              >
                {pending ? "Submitting..." : "Submit & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
