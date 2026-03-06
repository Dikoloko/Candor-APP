// Supabase REST API helper voor gedeeld leaderboard
// Configureer via VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env (of Netlify env vars)

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

export interface RemoteEntry {
  id?: number
  naam: string
  score: number
  totaal: number
  punten: number
  max_punten: number
  datum: string
}

export async function getRemoteLeaderboard(): Promise<RemoteEntry[]> {
  try {
    const res = await apiFetch('/leaderboard?select=naam,score,totaal,punten,max_punten,datum&order=punten.desc&limit=20')
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function addRemoteEntry(entry: Omit<RemoteEntry, 'id'>): Promise<void> {
  try {
    await apiFetch('/leaderboard', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(entry),
    })
  } catch {
    // Stil falen — lokaal leaderboard blijft werken
  }
}
