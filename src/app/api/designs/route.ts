import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  const { data, error } = await supabase
    .from('designs')
    .select('id, title, base_price, preview_url, is_published')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ ok:false, error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ ok:true, data }), { headers: { 'content-type': 'application/json' } })
}
