import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function Seller() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-10 text-center">
        <p className="text-slate-600">Please sign in to continue.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_seller")
    .eq("id", user.id)
    .single();

  const { data: products } = await supabase
    .from("base_products")
    .select("id,name,slug,description,active,base_cost")
    .eq("active", true)
    .order("updated_at", { ascending:false });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Seller</h1>
        {!profile?.is_seller && (
          <Link href="/seller/onboarding"><Button>Become a seller</Button></Link>
        )}
      </div>

      <h2 className="mb-4 text-lg font-medium">Catalog</h2>
      {(!products || products.length === 0) ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
          No base products yet. Check back later.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map(p => (
            <div key={p.id} className="group rounded-xl border bg-white p-4 shadow-soft transition hover:shadow-card">
              <div className="mb-3 aspect-square w-full rounded-lg bg-slate-50" />
              <div className="mb-1 font-medium">{p.name}</div>
              <div className="mb-3 line-clamp-2 text-xs text-slate-500">{p.description}</div>
              <Link href={`/seller/designs/new?base=${p.id}`}>
                <Button className="w-full">Design this</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
