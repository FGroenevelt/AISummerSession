import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitIdea } from '../lib/api'
import { isSupabaseConfigured } from '../lib/supabase'

const empty = { name: '', email: '', title: '', problem: '', solution: '' }

export default function Home() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Vul je naam in.'
    if (!form.email.trim()) e.email = 'Vul je e-mailadres in.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Vul een geldig e-mailadres in.'
    if (!form.title.trim()) e.title = 'Geef je idee een korte titel.'
    if (!form.problem.trim()) e.problem = 'Beschrijf welk probleem dit oplost.'
    if (!form.solution.trim()) e.solution = 'Beschrijf wat je zou willen ontwikkelen.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitIdea(form)
      navigate('/bedankt', {
        state: { name: form.name.trim(), title: form.title.trim() },
      })
    } catch (err) {
      console.error(err)
      setServerError(
        'Er ging iets mis bij het opslaan. Probeer het zo nog eens.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-kplus-ink sm:text-4xl">
          Wat ga jij met AI oplossen?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Welke tool, dashboard of automatisering zou jij willen ontwikkelen?
          Dien je idee in voor de AI-sessie. Tijdens de sessie gaan we aan de slag
          met de meest gekozen ideeën.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-xl border border-kplus-blue/30 bg-kplus-blue/5 px-4 py-3 text-sm text-kplus-ink">
          🧪 <strong>Lokale testmodus</strong> — inzendingen en stemmen worden
          opgeslagen in een SQLite-database in je eigen browser. Vul later{' '}
          <code>.env</code> in (zie <code>.env.example</code>) om over te
          schakelen naar Supabase.
        </div>
      )}

      <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
        <Field label="Naam" error={errors.name}>
          <input
            className="input"
            value={form.name}
            onChange={update('name')}
            placeholder="Je naam"
            autoComplete="name"
          />
        </Field>

        <Field label="E-mailadres" error={errors.email}>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="jij@kplusv.nl"
            autoComplete="email"
          />
        </Field>

        <Field label="Titel van je idee" error={errors.title}>
          <input
            className="input"
            value={form.title}
            onChange={update('title')}
            placeholder="Korte omschrijving van je idee"
          />
        </Field>

        <Field
          label="Welk probleem of proces lost dit op?"
          error={errors.problem}
        >
          <textarea
            className="input min-h-[96px]"
            value={form.problem}
            onChange={update('problem')}
            placeholder="Wat kost nu veel tijd, gaat vaak fout of kan slimmer?"
          />
        </Field>

        <Field
          label="Wat zou je precies willen ontwikkelen?"
          error={errors.solution}
        >
          <textarea
            className="input min-h-[96px]"
            value={form.solution}
            onChange={update('solution')}
            placeholder="Tool, dashboard, automatisering… beschrijf je gewenste oplossing."
          />
        </Field>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Bezig met versturen…' : 'Idee indienen'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="-mt-1 mb-1.5 text-sm text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
