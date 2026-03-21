import { Link, useLocation } from 'react-router-dom'
import { Button } from '@arya/design-system'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/surveys', label: 'Surveys' },
  { path: '/participants', label: 'Participants' },
  { path: '/rules', label: 'Rules' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F7' }}>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(29, 29, 31, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: 48,
          gap: 32,
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#F5F5F7', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Teammate Voices
          </Link>

          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  color: location.pathname === item.path ? '#fff' : 'rgba(245,245,247,0.6)',
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <Link to="/surveys/new" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">Create Survey</Button>
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
