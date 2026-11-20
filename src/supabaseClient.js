import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient throws on a missing URL, which would blank the whole page.
// Export null plus a message instead, so the app can show what's wrong.
export const configError =
  !url || !key
    ? 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart npm run dev.'
    : null

export const supabase = configError ? null : createClient(url, key)
