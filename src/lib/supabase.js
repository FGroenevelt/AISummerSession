import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Duidelijke foutmelding tijdens ontwikkeling als de .env ontbreekt.
  console.warn(
    '[supabase] VITE_SUPABASE_URL of VITE_SUPABASE_ANON_KEY ontbreekt. ' +
      'Vul .env in (zie .env.example) en herstart de dev-server.'
  )
}

// Val terug op een onschadelijke placeholder-URL zodat createClient niet
// crasht wanneer de .env nog ontbreekt; de UI toont dan een waarschuwing.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)

// Handig om in de UI te kunnen tonen dat de configuratie nog ontbreekt.
export const isSupabaseConfigured = Boolean(url && anonKey)
