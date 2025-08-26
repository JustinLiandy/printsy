// src/app/admin/products/page.tsx
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-3 text-xl font-bold">Admin</h1>
        <p className="text-slate-600">Not authorized.</p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("base_products")
    .select("id,name,slug,base_cost,active,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Base Products</h1>
        <Link href="/admin/products/new">
          <Button variant="outline">New product</Button>
        </Link>
      </div>

      {!products?.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No base products yet. Create your first one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-right">Base cost</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-right">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.slug}</td>
                  <td className="px-4 py-3 text-right">${Number(p.base_cost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{p.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
