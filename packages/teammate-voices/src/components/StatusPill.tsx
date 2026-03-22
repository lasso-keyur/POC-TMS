interface StatusPillProps {
  label: string
  variant?: 'draft' | 'active' | 'closed' | 'warning' | 'default'
}

export default function StatusPill({ label, variant = 'default' }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${variant}`}>
      {label}
    </span>
  )
}
