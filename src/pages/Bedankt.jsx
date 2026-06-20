import { Link, useLocation } from 'react-router-dom'

export default function Bedankt() {
  const { state } = useLocation()
  const name = state?.name
  const title = state?.title

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="card p-8 sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-kplus-blue/10 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold text-kplus-ink sm:text-3xl">
          Bedankt{name ? `, ${name}` : ''}!
        </h1>
        <p className="mt-3 text-slate-600">
          Je idee{title ? ` “${title}”` : ''} is ingediend. Je ontvangt een
          korte bevestigingsmail. Bekijk nu alle ideeën en stem op je favorieten.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/overzicht" className="btn-primary">
            Bekijk &amp; stem op ideeën
          </Link>
          <Link to="/" className="btn-secondary">
            Nog een idee indienen
          </Link>
        </div>
      </div>
    </div>
  )
}
