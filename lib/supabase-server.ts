import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getServerSupabase(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Init kun når ruten faktisk kalles (ikke under build/import)
  if (!url || !key) {
    throw new Error(
      'Supabase env mangler. Sett NEXT_PUBLIC_SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}
