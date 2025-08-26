import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
    redirect("/auth/sign-in");
  }

  const { data: products, error } = await supabase
    .from("base_products")
    .select("id,name,slug,active,base_cost,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Base Products</h1>
        <Link href="/admin/products/new" className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:border-brand-300">
          New product
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Nothing here yet. <Link className="text-brand-600 underline" href="/admin/products/new">Create one</Link>.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Base cost</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.slug}</td>
                  <td className="px-4 py-3 text-slate-600">Rp {Number(p.base_cost ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{p.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <Link className="text-brand-600 hover:underline" href={`/admin/products/${p.id}/edit`}>
                      Edit
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
