import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitIdea } from '../lib/api'
import { isSupabaseConfigured } from '../lib/supabase'

const empty = { name: '', email: '', title: '', problem: '', solution: '' }

// Voorbeeldideeën als inspiratie (uitklapbaar boven het formulier).
const examples = [
  {
    cat: 'Acquisitie',
    icon: '📄',
    color: '#0079AE',
    title: 'Slimme vragen uit een uitvraag',
    text: 'Plak een uitvraag van een potentiële klant in de tool. De tool genereert direct gerichte vragen voor het kennismakingsgesprek, aanknopingspunten voor de offerte en lacunes die je nog moet ophalen.',
  },
  {
    cat: 'Due diligence',
    icon: '📊',
    color: '#8E61A2',
    title: 'Automatische marktanalyse voor start-ups',
    text: 'Vul een korte vragenlijst in over een start-up. De tool doorzoekt publieke bronnen, analyseert het concurrentielandschap en levert een gestructureerde DD-rapportage — inclusief kansen, risico’s en marktpositie.',
  },
  {
    cat: 'Vergaderen',
    icon: '💬',
    color: '#545DA4',
    title: 'Samenvatting en actiepunten na elk Teams-gesprek',
    text: 'Na elke Teams-vergadering verschijnt automatisch een samenvatting met actiepunten in de meeting-chat. Geen handmatige notulen meer — de beslissingen en to-do’s staan er direct in, voor alle deelnemers.',
  },
  {
    cat: 'Tijdregistratie',
    icon: '⏰',
    color: '#0079AE',
    title: 'Automatische herinnering om uren in te dienen',
    text: 'Op een vaste dag en tijd stuurt een geautomatiseerde flow een persoonlijk Teams-berichtje met een directe link naar Simplicate. Vergeet nooit meer je uren in te voeren en in te dienen.',
  },
]

export default function Home() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showExamples, setShowExamples] = useState(false)
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
      <div className="mb-8">
        <video
          className="w-full rounded-xl2 shadow-card"
          src={`${import.meta.env.BASE_URL}intro-video.mp4`}
          poster={`${import.meta.env.BASE_URL}intro-poster.jpg`}
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      </div>

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

      <div className="card mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExamples((v) => !v)}
          aria-expanded={showExamples}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-kplus-ink">
            <span aria-hidden="true">💡</span>
            Even inspiratie nodig? Bekijk 4 voorbeelden
          </span>
          <svg
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
              showExamples ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showExamples && (
          <div className="grid gap-4 border-t border-slate-200 p-5 sm:grid-cols-2">
            {examples.map((ex) => (
              <div
                key={ex.title}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div
                  className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-base"
                  style={{ background: `${ex.color}1a` }}
                >
                  <span aria-hidden="true">{ex.icon}</span>
                </div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: ex.color }}
                >
                  {ex.cat}
                </p>
                <h3 className="mt-0.5 font-bold leading-snug text-kplus-ink">
                  {ex.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{ex.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
