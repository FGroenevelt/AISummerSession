import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchIdeas, castVote } from '../lib/api'
import { getVotedIdeas } from '../lib/voter'

export default function Overzicht() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('votes') // 'votes' | 'new'
  const [voted, setVoted] = useState(() => getVotedIdeas())
  const [pending, setPending] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setIdeas(await fetchIdeas())
    } catch (err) {
      console.error(err)
      setError('Kon de ideeën niet laden. Ververs de pagina en probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  async function onVote(id) {
    if (voted.has(id) || pending) return
    setPending(id)
    // Optimistische update: teller direct +1.
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i))
    )
    setVoted((prev) => new Set(prev).add(id))
    try {
      const res = await castVote(id)
      if (res.alreadyVoted) {
        // Stem bestond al in de DB: corrigeer de optimistische +1.
        setIdeas((prev) =>
          prev.map((i) => (i.id === id ? { ...i, votes: i.votes - 1 } : i))
        )
      }
    } catch (err) {
      console.error(err)
      // Rol terug bij fout.
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, votes: i.votes - 1 } : i))
      )
      setVoted((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setError('Stem kon niet worden opgeslagen. Probeer het opnieuw.')
    } finally {
      setPending(null)
    }
  }

  const sorted = useMemo(() => {
    const arr = [...ideas]
    if (sort === 'votes')
      arr.sort((a, b) => b.votes - a.votes || new Date(b.created_at) - new Date(a.created_at))
    else arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return arr
  }, [ideas, sort])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-kplus-ink">Alle ideeën</h1>
          <p className="mt-2 text-slate-600">
            Stem op de ideeën die jij het liefst gebouwd ziet worden.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Sorteer:</span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
            <SortBtn active={sort === 'votes'} onClick={() => setSort('votes')}>
              Meeste stemmen
            </SortBtn>
            <SortBtn active={sort === 'new'} onClick={() => setSort('new')}>
              Nieuwste
            </SortBtn>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              hasVoted={voted.has(idea.id)}
              pending={pending === idea.id}
              onVote={() => onVote(idea.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function IdeaCard({ idea, hasVoted, pending, onVote }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold leading-snug text-kplus-ink">
            {idea.title}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">door {idea.name}</p>
        </div>
        <button
          onClick={onVote}
          disabled={hasVoted || pending}
          className={[
            'flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition',
            hasVoted
              ? 'cursor-default border-kplus-blue bg-kplus-blue text-white'
              : 'border-slate-300 text-kplus-blue hover:border-kplus-blue hover:bg-kplus-blue/5',
          ].join(' ')}
          title={hasVoted ? 'Je hebt al gestemd' : 'Stem op dit idee'}
        >
          <span className="text-lg leading-none">▲</span>
          <span className="text-base font-bold leading-tight">{idea.votes}</span>
        </button>
      </div>

      <Detail label="Probleem" text={idea.problem} />
      <Detail label="Gewenste oplossing" text={idea.solution} />

      <div className="mt-auto pt-3 text-xs font-medium text-slate-400">
        {hasVoted ? 'Bedankt voor je stem!' : `${idea.votes} ${idea.votes === 1 ? 'stem' : 'stemmen'}`}
      </div>
    </article>
  )
}

function Detail({ label, text }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-kplus-purple">
        {label}
      </p>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  )
}

function SortBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-md px-3 py-1.5 text-sm font-semibold transition',
        active ? 'bg-kplus-blue text-white' : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <p className="text-lg font-semibold text-kplus-ink">Nog geen ideeën</p>
      <p className="mt-2 text-slate-600">Wees de eerste die een idee indient!</p>
      <Link to="/" className="btn-primary mt-5">
        Idee indienen
      </Link>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-44 animate-pulse bg-slate-100" />
      ))}
    </div>
  )
}
