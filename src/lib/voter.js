// Anonieme, niet-waterdichte stem-identificatie.
// We bewaren een uniek device-token in localStorage. Dat token koppelen we
// per stem in Supabase (votes.voter_token). Samen met een unieke constraint
// op (idea_id, voter_token) voorkomt dit dubbel stemmen op hetzelfde idee
// vanaf hetzelfde apparaat — een redelijke drempel, geen fraudepreventie.

const STORAGE_KEY = 'kplusv_voter_token'

export function getVoterToken() {
  try {
    let token = localStorage.getItem(STORAGE_KEY)
    if (!token) {
      token =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(STORAGE_KEY, token)
    }
    return token
  } catch {
    // Privémodus o.i.d. waar localStorage faalt: val terug op sessietoken.
    return `ephemeral-${Math.random().toString(36).slice(2)}`
  }
}

// Lokale cache van ideeën waarop dit device al gestemd heeft, zodat de UI
// de stemknop direct kan uitschakelen (de DB is de echte bron van waarheid).
const VOTED_KEY = 'kplusv_voted_ideas'

export function getVotedIdeas() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function markVoted(ideaId) {
  try {
    const set = getVotedIdeas()
    set.add(ideaId)
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]))
  } catch {
    /* negeer */
  }
}
