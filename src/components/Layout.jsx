import { NavLink, Link } from 'react-router-dom'

const navClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-kplus-blue/10 text-kplus-blue'
      : 'text-slate-600 hover:bg-slate-100 hover:text-kplus-ink',
  ].join(' ')

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo-kplusv.webp"
              alt="KplusV"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="hidden text-lg font-bold text-kplus-ink sm:block">
              Ideeën- &amp; stemtool
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Indienen
            </NavLink>
            <NavLink to="/overzicht" className={navClass}>
              Overzicht
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row">
          <span>KplusV · AI-sessie — huiswerk onderdeel 2 (vibe-coden)</span>
          <span className="flex gap-1">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: '#0079AE' }}
            />
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: '#545DA4' }}
            />
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: '#8E61A2' }}
            />
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: '#B0A9CE' }}
            />
          </span>
        </div>
      </footer>
    </div>
  )
}
