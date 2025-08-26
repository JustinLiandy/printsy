import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminProducts() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!user || !isAdmin) redirect("/");

  const { data: products, error } = await supabase
    .from("base_products")
    .select("id,name,slug,active,updated_at,base_cost,description")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Base products</h1>
          <p className="text-sm text-slate-500">These are the blanks sellers can design on.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="shadow-xs">Create product</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-soft">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products?.map(p => (
              <tr key={p.id} className="text-sm">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  {p.description && <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>}
                </td>
                <td className="px-4 py-3 text-slate-500">{p.slug}</td>
                <td className="px-4 py-3">Rp {Number(p.base_cost).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.active ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-brand-700 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No base products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
