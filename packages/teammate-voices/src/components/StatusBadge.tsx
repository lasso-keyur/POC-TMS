import type { ActionStatus } from '@/types/dashboard'

const DOT_COLORS: Record<string, string | undefined> = {
  'In progress': '#007AFF',
  'Not started': '#FF3B30',
}

export default function StatusBadge({ status }: { status: ActionStatus }) {
  const dotColor = DOT_COLORS[status]

  return (
    <span className="status-badge">
      {dotColor && (
        <span className="status-badge__dot" style={{ backgroundColor: dotColor }} />
      )}
      {status}
    </span>
  )
}
