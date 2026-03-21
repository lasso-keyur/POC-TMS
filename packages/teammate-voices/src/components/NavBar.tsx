import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/programs', label: 'Programs' },
  { path: '/surveys', label: 'Surveys', hasDropdown: true },
  { path: '/reports', label: 'Reports' },
  { path: '/admin', label: 'Administration' },
]

export default function NavBar() {
  const location = useLocation()

  return (
    <nav className="nav-bar">
      <div className="nav-bar__inner">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-bar__link ${location.pathname === item.path ? 'nav-bar__link--active' : ''}`}
          >
            {item.label}
            {item.hasDropdown && (
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="nav-bar__chevron">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
