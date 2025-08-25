import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Design = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string | null;
  is_published: boolean;
};

export default async function SellerDashboard() {
  const supabase = await supabaseServerRSC();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/seller");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_seller")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_seller) redirect("/seller/onboarding");

  const { data: designs, error } = await supabase
    .from("designs")
    .select("id,title,base_price,preview_url,is_published")
    .eq("owner", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Seller Dashboard</h1>
          <p className="mt-1 text-slate-600">Manage your designs, prices, and publication status.</p>
        </div>
        <Link href="/seller/designs/new">
          <Button size="lg">+ New Design</Button>
        </Link>
      </div>

      {(!designs || designs.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="mb-3 text-slate-600">No designs yet.</p>
          <Link href="/seller/designs/new"><Button>Create your first design</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designs.map((d: Design) => (
            <Card key={d.id} className="shadow-card overflow-hidden">
              <div className="relative h-48 w-full bg-slate-50">
                {d.preview_url ? (
                  <img src={d.preview_url} alt={d.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No preview</div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="truncate text-lg">{d.title}</CardTitle>
                <CardDescription>Rp{d.base_price.toLocaleString("id-ID")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/seller/designs/${d.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                  {d.is_published ? (
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" data-id={d.id}>Unpublish</Button>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" data-id={d.id}>Publish</Button>
                  )}
                  <Button size="sm" variant="destructive" data-id={d.id}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
