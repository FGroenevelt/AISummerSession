import { supabase } from './supabase'
import { getVoterToken, markVoted } from './voter'

// Eén idee indienen: maak (of hergebruik) een deelnemer en schrijf het idee weg.
export async function submitIdea({ name, email, title, problem, solution }) {
  const { data: participant, error: pErr } = await supabase
    .from('participants')
    .insert({ name: name.trim(), email: email.trim() })
    .select('id')
    .single()
  if (pErr) throw pErr

  const { data: idea, error: iErr } = await supabase
    .from('ideas')
    .insert({
      participant_id: participant.id,
      title: title.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
    })
    .select('id, title')
    .single()
  if (iErr) throw iErr

  return idea
}

// Alle ideeën met indiener-naam en stemaantal. Sorteren doen we client-side
// zodat schakelen tussen 'meeste stemmen' en 'nieuwste' geen extra call kost.
export async function fetchIdeas() {
  const { data: ideas, error: iErr } = await supabase
    .from('ideas')
    .select('id, title, problem, solution, created_at, participants(name)')
  if (iErr) throw iErr

  const { data: votes, error: vErr } = await supabase
    .from('votes')
    .select('idea_id')
  if (vErr) throw vErr

  const counts = new Map()
  for (const v of votes) counts.set(v.idea_id, (counts.get(v.idea_id) ?? 0) + 1)

  return ideas.map((i) => ({
    id: i.id,
    title: i.title,
    problem: i.problem,
    solution: i.solution,
    created_at: i.created_at,
    name: i.participants?.name ?? 'Onbekend',
    votes: counts.get(i.id) ?? 0,
  }))
}

// Eén stem uitbrengen. Een unieke constraint (idea_id, voter_token) in de DB
// weigert dubbel stemmen vanaf hetzelfde device (foutcode 23505).
export async function castVote(ideaId) {
  const voter_token = getVoterToken()
  const { error } = await supabase
    .from('votes')
    .insert({ idea_id: ideaId, voter_token })

  if (error) {
    if (error.code === '23505') {
      markVoted(ideaId)
      return { alreadyVoted: true }
    }
    throw error
  }
  markVoted(ideaId)
  return { alreadyVoted: false }
}

// Kerncijfers voor het dashboard, afgeleid van dezelfde ideeën-data.
export async function fetchStats() {
  const ideas = await fetchIdeas()
  const { count: voteCount } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
  const { count: participantCount } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })

  const top = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 5)

  return {
    totalIdeas: ideas.length,
    totalVotes: voteCount ?? 0,
    uniqueParticipants: participantCount ?? 0,
    top,
  }
}
