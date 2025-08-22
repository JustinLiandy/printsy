// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // set in Vercel → Settings → Env
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // set in Vercel → Settings → Env
  { auth: { persistSession: false } }
)
