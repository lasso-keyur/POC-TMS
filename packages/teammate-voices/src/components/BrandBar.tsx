import { Link } from 'react-router-dom'

export default function BrandBar() {
  return (
    <header className="brand-bar">
      <div className="brand-bar__inner">
        <div className="brand-bar__left">
          <Link to="/" className="brand-bar__logo">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
              <path d="M12 0L24 20H0L12 0Z" fill="#C41230" />
            </svg>
            <span className="brand-bar__name">TEAMMATE VOICES</span>
          </Link>
          <span className="brand-bar__divider" />
          <span className="brand-bar__app-name">Employee Survey</span>
        </div>
        <div className="brand-bar__right">
          <span className="brand-bar__greeting">Hi FirstName</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand-bar__avatar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke="#fff" strokeWidth="1.5" />
              <path d="M3 17.5C3 14.5 6 12.5 10 12.5C14 12.5 17 14.5 17 17.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  )
}
