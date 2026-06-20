import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setStats(await fetchStats())
      } catch (err) {
        console.error(err)
        setError('Kon de cijfers niet laden. Ververs de pagina.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-kplus-ink">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Hoe loopt de inzending en welke ideeën leven het meest?
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Ingediende ideeën"
          value={stats?.totalIdeas}
          loading={loading}
          color="#0079AE"
        />
        <Stat
          label="Uitgebrachte stemmen"
          value={stats?.totalVotes}
          loading={loading}
          color="#8E61A2"
        />
        <Stat
          label="Unieke deelnemers"
          value={stats?.uniqueParticipants}
          loading={loading}
          color="#545DA4"
        />
      </div>

      <h2 className="mb-3 mt-9 text-xl font-bold text-kplus-ink">
        Top ideeën
      </h2>
      <div className="card divide-y divide-slate-100 p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : stats?.top.length ? (
          stats.top.map((idea, i) => (
            <div
              key={idea.id}
              className="flex items-center gap-4 px-3 py-3"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: rankColor(i) }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-kplus-ink">
                  {idea.title}
                </p>
                <p className="truncate text-sm text-slate-500">
                  door {idea.name}
                </p>
              </div>
              <span className="shrink-0 text-right">
                <span className="text-xl font-extrabold text-kplus-blue">
                  {idea.votes}
                </span>
                <span className="ml-1 text-sm text-slate-400">
                  {idea.votes === 1 ? 'stem' : 'stemmen'}
                </span>
              </span>
            </div>
          ))
        ) : (
          <p className="px-3 py-6 text-center text-slate-500">
            Nog geen ideeën.{' '}
            <Link to="/" className="font-semibold text-kplus-blue">
              Dien het eerste in
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, loading, color }) {
  return (
    <div className="card relative overflow-hidden p-6">
      <div
        className="absolute left-0 top-0 h-1.5 w-full"
        style={{ background: color }}
      />
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-10 w-16 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-1 text-4xl font-extrabold text-kplus-ink">{value}</p>
      )}
    </div>
  )
}

function rankColor(i) {
  return ['#0079AE', '#545DA4', '#8E61A2', '#B0A9CE', '#B0A9CE'][i] ?? '#B0A9CE'
}
