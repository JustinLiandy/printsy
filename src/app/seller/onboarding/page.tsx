"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

// shadcn/ui
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  shop_name: z.string().min(3, "Shop name must be at least 3 characters"),
  payout_type: z.enum(["bank", "ewallet"] as const, { message: "Choose a payout type" }),
  payout_name: z.string().min(2, "Account holder name is required"),
  payout_account: z.string().min(4, "Enter your bank number or e‑wallet ID"),
  tax_id: z.string().optional()
});


type FormValues = z.infer<typeof schema>;

export default function SellerOnboardingPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [notLoggedIn, setNotLoggedIn] = React.useState(false);
  const [alreadySeller, setAlreadySeller] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

type PayoutType = "bank" | "ewallet";

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    shop_name: "",
    // keep it undefined at start, but cast properly so TS doesn’t scream
    payout_type: undefined as unknown as PayoutType,
    payout_name: "",
    payout_account: "",
    tax_id: ""
  },
  mode: "onTouched"
});

  // Prefill + guards
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) {
          setNotLoggedIn(true);
          setLoading(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_seller, shop_name, payout_type, payout_name, payout_account, tax_id")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) {
        if (error) {
          // Don’t expose internals; user can retry
          setSubmitError("Couldn’t load your profile. Please refresh.");
        }
        if (profile?.is_seller) {
          setAlreadySeller(true);
        } else {
          // prefill if previously saved
          form.reset({
            shop_name: profile?.shop_name ?? "",
            payout_type: (profile?.payout_type as "bank" | "ewallet") ?? undefined,
            payout_name: profile?.payout_name ?? "",
            payout_account: profile?.payout_account ?? "",
            tax_id: profile?.tax_id ?? ""
          });
        }
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase, form]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitError("Please log in first.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        shop_name: values.shop_name.trim(),
        payout_type: values.payout_type,
        payout_name: values.payout_name.trim(),
        payout_account: values.payout_account.trim(),
        tax_id: values.tax_id?.trim() || null,
        is_seller: true
      })
      .eq("id", user.id);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    // smooth redirect
    router.push("/seller");
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-44 rounded bg-slate-200" />
          <div className="h-20 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Login required</CardTitle>
            <CardDescription>Use the “Login” button in the header to get a magic link, then return here.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (alreadySeller) {
    // Don’t waste time, get them to their dashboard
    if (typeof window !== "undefined") {
      router.replace("/seller");
    }
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>Tell us about your shop and how to pay you. You can edit these later.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="shop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BlueCat Studio" {...field} />
                    </FormControl>
                    <FormDescription>This name appears on your public profile and invoices.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="payout_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payout type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a payout method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank">Bank transfer</SelectItem>
                          <SelectItem value="ewallet">E‑Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>We’ll use this for automated payouts later.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payout_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account holder name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your legal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="payout_account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account number / E‑wallet ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234‑5678‑90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="NPWP, if any" {...field} />
                    </FormControl>
                    <FormDescription>Optional for MVP. You can add it later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => history.back()}
                className="border-slate-300 text-slate-700"
              >
                Back
              </Button>

              <Button
                type="submit"
                className="bg-brand-600 text-white hover:bg-brand-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Become a seller"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <p className="mt-4 text-xs text-slate-500">
        Your payout info is stored securely and only visible to you and admins. Automated payouts arrive
        after we enable the payment bridge in Short‑Term features.
      </p>
    </div>
  );
}
