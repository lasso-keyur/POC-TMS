import { Link } from 'react-router-dom'

/** Bank of America "flagscape" mark (approximation) */
export function BofaFlag({ width = 34 }: { width?: number }) {
  const height = Math.round(width * 0.62)
  return (
    <svg width={width} height={height} viewBox="0 0 34 21" fill="none" aria-hidden="true">
      <path d="M11 1 L18 1 L9 9 L2 9 Z" fill="#E31837" />
      <path d="M20 1 L27 1 L18 9 L11 9 Z" fill="#E31837" />
      <path d="M29 1 L34 1 L34 4.5 L27 9 L20 9 Z" fill="#E31837" />
      <path d="M9 12 L16 12 L7 20 L0 20 Z" fill="#012169" />
      <path d="M18 12 L25 12 L16 20 L9 20 Z" fill="#012169" />
      <path d="M27 12 L34 12 L34 15.5 L25 20 L18 20 Z" fill="#012169" />
    </svg>
  )
}

export default function BrandBar() {
  return (
    <header className="brand-bar">
      <div className="brand-bar__inner">
        <div className="brand-bar__left">
          <Link to="/" className="brand-bar__logo">
            <BofaFlag />
            <span className="brand-bar__name">BANK OF AMERICA</span>
          </Link>
          <span className="brand-bar__divider" />
          <span className="brand-bar__app-name">Employee Survey</span>
        </div>
        <div className="brand-bar__right">
          <span className="brand-bar__greeting">Hi FirstName</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 6L8 11L13 6" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand-bar__avatar">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#141414" strokeWidth="1.4" />
              <circle cx="10" cy="7.5" r="2.8" stroke="#141414" strokeWidth="1.4" />
              <path d="M4.5 16.5C5.5 13.8 7.5 12.5 10 12.5C12.5 12.5 14.5 13.8 15.5 16.5" stroke="#141414" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  )
}
