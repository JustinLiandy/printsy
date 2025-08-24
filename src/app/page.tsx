// src/app/page.tsx
import DesignCard from "@/components/DesignCard";
import { createClient } from "@supabase/supabase-js";

// Avoid static generation; always render on the server
export const dynamic = "force-dynamic";
// Belt and suspenders
export const revalidate = 0;

type Design = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string;
  is_published: boolean;
};

async function getDesigns(): Promise<Design[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data, error } = await supabase
    .from("designs")
    .select("id, title, base_price, preview_url, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function Home() {
  const designs = await getDesigns();

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Latest Designs</h1>

      {designs.length === 0 ? (
        <p className="text-sm opacity-70">
          No designs yet. Add one in Supabase and set <code>is_published</code> to true.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {designs.map(d => (
            <DesignCard
              key={d.id}
              id={d.id}
              title={d.title}
              base_price={d.base_price}
              preview_url={d.preview_url}
            />
          ))}
        </div>
      )}
    </main>
  );
}
