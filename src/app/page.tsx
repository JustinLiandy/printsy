// src/app/page.tsx
import { z } from "zod";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import DesignCard from "@/components/DesignCard";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DesignSchema = z.object({
  id: z.string(),
  title: z.string(),
  base_price: z.number(),
  preview_url: z.string().nullable(),
  is_published: z.boolean(),
});
type Design = z.infer<typeof DesignSchema>;

async function fetchDesigns(page = 1, pageSize = 12) {
  const supabase = supabaseServer();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("designs")
    .select("id,title,base_price,preview_url,is_published", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const designs = (data ?? []).map((d) => DesignSchema.parse(d));
  const total = (data as unknown as { length: number } & { count?: number })?.count ?? 0;
  return { designs, total };
}

export default async function Home({ searchParams }: { searchParams?: Record<string, string> }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const pageSize = 12;

  const { designs, total } = await fetchDesigns(page, pageSize);
  const hasNext = page * pageSize < total;
  const hasPrev = page > 1;

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_60%)]" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              New · Live design studio for creators
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
              Design. Sell. <span className="text-brand-600">Shine.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              A modern marketplace for custom apparel. Create designs in the browser and publish instantly.
              We’ll handle payments and the boring parts.
            </p>
<div className="mt-6 flex flex-wrap gap-3">
  <Link href="/seller">
    <Button>Start selling</Button>
  </Link>
  <a href="#catalog">
    <Button variant="outline">Explore catalog</Button>
  </a>
</div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Latest designs</h2>
          <p className="text-xs text-slate-500">
            Showing {(designs.length && (page - 1) * 12 + 1) || 0}–{(page - 1) * 12 + designs.length} of {total}
          </p>
        </div>

        {designs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            No designs yet. Be the first to{" "}
            <Link className="text-brand-600 underline" href="/seller">
              add one
            </Link>.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {designs.map((d: Design) => (
                <DesignCard
                  key={d.id}
                  id={d.id}
                  title={d.title}
                  base_price={d.base_price}
                  preview_url={d.preview_url ?? ""}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                aria-disabled={!hasPrev}
                className={`rounded-xl border px-4 py-2 text-sm ${
                  hasPrev ? "border-slate-300 text-slate-700 hover:border-slate-400" : "pointer-events-none opacity-40"
                }`}
                href={hasPrev ? `/?page=${page - 1}#catalog` : "#catalog"}
              >
                ← Newer
              </Link>
              <Link
                aria-disabled={!hasNext}
                className={`rounded-xl border px-4 py-2 text-sm ${
                  hasNext ? "border-slate-300 text-slate-700 hover:border-slate-400" : "pointer-events-none opacity-40"
                }`}
                href={hasNext ? `/?page=${page + 1}#catalog` : "#catalog"}
              >
                Older →
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
