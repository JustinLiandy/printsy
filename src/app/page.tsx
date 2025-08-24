import DesignCard from '@/components/DesignCard';

type Design = {
  id: string;
  title: string;
  base_price: number;
  preview_url: string;
  is_published: boolean;
};

// disable caching so new rows appear immediately
export const revalidate = 0;

async function getDesigns(): Promise<Design[]> {
  // Works locally and in prod if NEXT_PUBLIC_SITE_URL is set.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const res = await fetch(`${base}/api/designs`, { cache: 'no-store' });

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? 'Unknown error');
  return json.data as Design[];
}

export default async function Home() {
  const designs = await getDesigns();

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Latest Designs</h1>

      {designs.length === 0 ? (
        <p className="text-sm opacity-70">No designs yet. Add one in Supabase, set <code>is_published</code> true.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {designs.map(d => (
            <DesignCard key={d.id} id={d.id} title={d.title} base_price={d.base_price} preview_url={d.preview_url} />
          ))}
        </div>
      )}
    </main>
  );
}
