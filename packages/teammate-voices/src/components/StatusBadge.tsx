import type { Survey } from '@/types/survey'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: '#F2F2F7', color: '#8E8E93' },
  ACTIVE: { bg: '#D1FAE5', color: '#065F46' },
  CLOSED: { bg: '#FEE2E2', color: '#991B1B' },
  ARCHIVED: { bg: '#E5E7EB', color: '#374151' },
}

export default function StatusBadge({ status }: { status: Survey['status'] }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  )
}
