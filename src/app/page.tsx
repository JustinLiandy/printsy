import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data: designs, error } = await supabase
    .from('designs')
    .select('id, title, base_price, preview_url, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p className="text-red-600">Failed to load designs: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Discover designs</h1>
        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {designs?.length ? designs.map(d => (
            <article key={d.id} className="rounded-2xl border p-3 shadow-sm hover:shadow-md transition">
              {d.preview_url
                ? <img src={d.preview_url} alt={d.title} className="aspect-square w-full object-cover rounded-xl" />
                : <div className="aspect-square w-full rounded-xl bg-zinc-100" />}
              <div className="mt-3">
                <h2 className="font-medium">{d.title}</h2>
                <p className="text-sm text-zinc-600">
                  Rp {new Intl.NumberFormat('id-ID').format(d.base_price)}
                </p>
              </div>
            </article>
          )) : (
            <p className="text-zinc-600">No designs yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}
