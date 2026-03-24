import { useNavigate } from 'react-router-dom'
import Breadcrumb from '@/components/Breadcrumb'

const ADMIN_CARDS = [
  {
    title: 'Email Templates',
    description: 'Create and manage email templates for survey invitations, reminders, thank-you messages, and program communications.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    path: '/templates',
    count: null as string | null,
  },
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions for the platform.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    path: '/admin/users',
    count: 'Coming soon',
  },
  {
    title: 'System Settings',
    description: 'Configure platform settings, integrations, and defaults.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    path: '/admin/settings',
    count: 'Coming soon',
  },
]

export default function Administration() {
  const navigate = useNavigate()

  return (
    <>
      <Breadcrumb items={[
        { label: 'Home', path: '/' },
        { label: 'Administration' },
      ]} />

      <h1 className="admin-page__title">Administration</h1>

      <div className="admin-page">
      <div className="admin-page__grid">
        {ADMIN_CARDS.map(card => {
          const isDisabled = card.count === 'Coming soon'
          return (
            <button
              key={card.title}
              className={`admin-card${isDisabled ? ' admin-card--disabled' : ''}`}
              onClick={() => !isDisabled && navigate(card.path)}
              disabled={isDisabled}
            >
              <div className="admin-card__icon">{card.icon}</div>
              <h3 className="admin-card__title">{card.title}</h3>
              <p className="admin-card__description">{card.description}</p>
              {card.count && (
                <span className="admin-card__badge">{card.count}</span>
              )}
            </button>
          )
        })}
      </div>
      </div>
    </>
  )
}
