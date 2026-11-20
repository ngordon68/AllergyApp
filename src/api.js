import { supabase, configError } from './supabaseClient.js'

// Reads allergies and the 20 newest checks from the `entries` table.
export async function loadEntries() {
  if (configError) throw new Error(configError)

  const [allergyRes, checkRes] = await Promise.all([
    supabase
      .from('entries')
      .select('id, name')
      .eq('kind', 'allergy')
      .order('created_at', { ascending: true }),
    supabase
      .from('entries')
      .select('id, kind, name, matched_allergens, is_safe, created_at')
      .eq('kind', 'check')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (allergyRes.error) throw allergyRes.error
  if (checkRes.error) throw checkRes.error

  return { allergies: allergyRes.data, history: checkRes.data }
}
