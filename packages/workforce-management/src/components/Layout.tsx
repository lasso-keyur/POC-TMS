import { Link, useLocation, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="wfm-layout">
      <header className="wfm-brand-bar">
        <div className="wfm-brand-bar__left">
          <span className="wfm-brand-bar__logo">Workforce Management</span>
          <span className="wfm-brand-bar__divider" />
          <span className="wfm-brand-bar__subtitle">Employee Dashboard</span>
        </div>
        <div className="wfm-brand-bar__user">
          Hi FirstName
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="white" strokeWidth="1.5" />
            <circle cx="14" cy="11" r="4" stroke="white" strokeWidth="1.5" />
            <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </header>

      <nav className="wfm-nav">
        <div className="wfm-nav__inner">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`wfm-nav__link${location.pathname === item.path ? ' wfm-nav__link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="wfm-main">
        <Outlet />
      </main>

      <footer className="wfm-footer">
        Workforce Management &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
