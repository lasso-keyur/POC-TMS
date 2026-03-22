import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface DropdownItem {
  path: string
  label: string
}

interface NavItem {
  path: string
  label: string
  hasDropdown?: boolean
  dropdownItems?: DropdownItem[]
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home' },
  { path: '/programs', label: 'Programs' },
  {
    path: '/surveys',
    label: 'Surveys',
    hasDropdown: true,
    dropdownItems: [
      { path: '/surveys', label: 'Survey Library' },
      { path: '/surveys/new', label: 'Create Survey' },
    ],
  },
  { path: '/reports', label: 'Reports' },
  { path: '/admin', label: 'Administration' },
]

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (item: NavItem) =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')

  return (
    <nav className="nav-bar">
      <div className="nav-bar__inner">
        {NAV_ITEMS.map(item =>
          item.hasDropdown && item.dropdownItems ? (
            <div
              key={item.path}
              className="nav-bar__dropdown-wrapper"
              ref={openDropdown === item.path ? dropdownRef : undefined}
            >
              <button
                className={`nav-bar__link nav-bar__dropdown-trigger${isActive(item) ? ' nav-bar__link--active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === item.path ? null : item.path)}
              >
                {item.label}
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  className={`nav-bar__chevron${openDropdown === item.path ? ' nav-bar__chevron--open' : ''}`}
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {openDropdown === item.path && (
                <div className="nav-bar__dropdown">
                  {item.dropdownItems.map(sub => (
                    <button
                      key={sub.path}
                      className="nav-bar__dropdown-item"
                      onClick={() => {
                        setOpenDropdown(null)
                        navigate(sub.path)
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-bar__link${isActive(item) ? ' nav-bar__link--active' : ''}`}
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
