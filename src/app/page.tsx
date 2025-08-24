import { supabaseServer } from "@/lib/supabaseServer";
import DesignCard from "@/components/DesignCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Design = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string | null;
  is_published: boolean;
};

export default async function Home() {
  const supabase = supabaseServer();
  const { data: designs, error } = await supabase
    .from("designs")
    .select("id,title,base_price,preview_url,is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Design. Sell. <span className="text-brand-500">Shine.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Printsy makes it effortless to launch your apparel line. Upload artwork, set prices,
              and start selling. We’ll handle the boring parts.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/seller/designs/new" className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600">
                Start Selling
              </a>
              <a href="#catalog" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-600">
                Explore Catalog
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-slate-900">Latest Designs</h2>
        {(!designs || designs.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No designs yet. Be the first to <a className="text-brand-600 underline" href="/seller/designs/new">add one</a>.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {designs.map((d: Design) => (
              <DesignCard
                key={d.id}
                id={d.id}
                title={d.title}
                base_price={d.base_price}
                preview_url={d.preview_url || ""}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
