import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { supabaseServerRSC } from "@/lib/supabaseServerRSC";
import { Button } from "@/components/ui/button";
import { setPublish } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DesignSchema = z.object({
  id: z.string(),
  title: z.string(),
  base_price: z.number(),
  preview_url: z.string().nullable(),
  is_published: z.boolean(),
  created_at: z.string()
});
type Design = z.infer<typeof DesignSchema>;

export default async function SellerDashboard() {
  const supabase = await supabaseServerRSC();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!user) {
    // not logged in: push them to sign in
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Sign in required</h1>
          <p className="mt-2 text-slate-600">You need to sign in to access your seller dashboard.</p>
          <div className="mt-6">
            <Link href="/auth/sign-in">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("designs")
    .select("id,title,base_price,preview_url,is_published,created_at")
    .eq("owner", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const designs: Design[] = (data ?? []).map(d => DesignSchema.parse(d));
  const published = designs.filter(d => d.is_published).length;
  const drafts = designs.length - published;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Designs
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, tweak, and publish. We’ll do the boring bits.
          </p>
        </div>
        <Link href="/seller/designs/new">
          <Button>Create new</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">{designs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Published</p>
          <p className="mt-1 text-2xl font-semibold">{published}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Drafts</p>
          <p className="mt-1 text-2xl font-semibold">{drafts}</p>
        </div>
      </div>

      {/* Grid */}
      {designs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-700">You have no designs yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Start with a blank product and build your first masterpiece.
          </p>
          <div className="mt-6">
            <Link href="/seller/designs/new">
              <Button>Start designing</Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map(d => (
            <li key={d.id} className="group rounded-xl border border-slate-200 bg-white p-3 shadow-soft transition hover:shadow-card">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={d.preview_url || "/placeholder.svg"}
                  alt={d.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
                {!d.is_published && (
                  <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                    Draft
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{d.title}</p>
                  <p className="text-sm text-slate-500">from Rp {Intl.NumberFormat("id-ID").format(d.base_price)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <Link href={`/seller/designs/${d.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>

                <form action={async () => { "use server"; await setPublish(d.id, !d.is_published); }}>
                  <Button size="sm">
                    {d.is_published ? "Unpublish" : "Publish"}
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
