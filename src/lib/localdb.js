// Lokale testdatabase: een échte SQLite (sql.js / WebAssembly) die volledig in
// de browser draait en zichzelf bewaart in localStorage. Hiermee kun je de tool
// testen (indienen, stemmen, dashboard) zonder Supabase.
//
// Zodra er een echte Supabase-config (.env) is, wordt deze module niet gebruikt
// — zie de schakellogica in api.js. De productiepad blijft dus ongewijzigd.

import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { getVoterToken, markVoted } from './voter'

const STORAGE_KEY = 'kplusv_sqlite_db'

// Hetzelfde model als supabase/schema.sql, maar in SQLite-dialect.
const SCHEMA = `
  create table if not exists participants (
    id text primary key,
    name text not null,
    email text not null,
    created_at text not null default (datetime('now'))
  );
  create table if not exists ideas (
    id text primary key,
    participant_id text not null references participants(id),
    title text not null,
    problem text not null,
    solution text not null,
    ai_challenges text,
    session_goal text,
    created_at text not null default (datetime('now'))
  );
  create table if not exists votes (
    id text primary key,
    idea_id text not null references ideas(id),
    voter_token text not null,
    created_at text not null default (datetime('now')),
    unique (idea_id, voter_token)
  );
`

let dbPromise = null

function getDb() {
  if (!dbPromise) dbPromise = init()
  return dbPromise
}

async function init() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const saved = localStorage.getItem(STORAGE_KEY)
  let db
  if (saved) {
    const bytes = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0))
    db = new SQL.Database(bytes)
  } else {
    db = new SQL.Database()
    db.run(SCHEMA)
  }
  return db
}

function persist(db) {
  const bytes = db.export()
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  localStorage.setItem(STORAGE_KEY, btoa(binary))
}

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

// Hulpfunctie: één select-query → array van objecten.
function rows(db, sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const out = []
  while (stmt.step()) out.push(stmt.getAsObject())
  stmt.free()
  return out
}

export async function submitIdea({
  name,
  email,
  title,
  problem,
  solution,
  aiChallenges,
  sessionGoal,
}) {
  const db = await getDb()
  const participantId = uuid()
  const ideaId = uuid()
  db.run('insert into participants (id, name, email) values (?, ?, ?)', [
    participantId,
    name.trim(),
    email.trim(),
  ])
  db.run(
    `insert into ideas (id, participant_id, title, problem, solution, ai_challenges, session_goal)
     values (?, ?, ?, ?, ?, ?, ?)`,
    [
      ideaId,
      participantId,
      title.trim(),
      problem.trim(),
      solution.trim(),
      aiChallenges?.trim() || null,
      sessionGoal?.trim() || null,
    ]
  )
  persist(db)
  return { id: ideaId, title: title.trim() }
}

export async function fetchIdeas() {
  const db = await getDb()
  return rows(
    db,
    `select i.id, i.title, i.problem, i.solution,
            i.ai_challenges as aiChallenges, i.session_goal as sessionGoal, i.created_at,
            p.name as name,
            (select count(*) from votes v where v.idea_id = i.id) as votes
     from ideas i
     join participants p on p.id = i.participant_id`
  ).map((r) => ({ ...r, votes: Number(r.votes) }))
}

export async function castVote(ideaId) {
  const db = await getDb()
  const voter_token = getVoterToken()
  try {
    db.run('insert into votes (id, idea_id, voter_token) values (?, ?, ?)', [
      uuid(),
      ideaId,
      voter_token,
    ])
    persist(db)
    markVoted(ideaId)
    return { alreadyVoted: false }
  } catch (err) {
    // UNIQUE-constraint: er is al gestemd vanaf dit device.
    if (String(err).includes('UNIQUE')) {
      markVoted(ideaId)
      return { alreadyVoted: true }
    }
    throw err
  }
}

export async function fetchStats() {
  const db = await getDb()
  const ideas = await fetchIdeas()
  const [{ c: totalVotes }] = rows(db, 'select count(*) as c from votes')
  const [{ c: uniqueParticipants }] = rows(
    db,
    'select count(*) as c from participants'
  )
  const top = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 5)
  return {
    totalIdeas: ideas.length,
    totalVotes: Number(totalVotes),
    uniqueParticipants: Number(uniqueParticipants),
    top,
  }
}
