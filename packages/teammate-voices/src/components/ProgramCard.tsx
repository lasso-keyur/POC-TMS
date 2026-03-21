import { Link } from 'react-router-dom'
import type { Program } from '@/types/program'

interface ProgramCardProps {
  program: Program
}

const PROGRESS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'Not started': { bg: '#FEE2E2', color: '#991B1B', label: 'Not started' },
  'NOT_STARTED': { bg: '#FEE2E2', color: '#991B1B', label: 'Not started' },
  'In progress': { bg: '#DBEAFE', color: '#1E40AF', label: 'In progress' },
  'IN_PROGRESS': { bg: '#DBEAFE', color: '#1E40AF', label: 'In progress' },
  'Complete': { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
  'COMPLETE': { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
}

function formatStatus(status: string): string {
  if (status === 'ACTIVE') return 'Active'
  if (status === 'INACTIVE') return 'Inactive'
  return status
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const progressStyle = PROGRESS_STYLES[program.surveyProgress] || PROGRESS_STYLES['Not started']

  return (
    <div
      className="program-card"
      style={{
        background: '#f5f5f7',
        border: 'none',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <div className="program-card__badges">
        <span className="program-card__badge program-card__badge--status">
          {formatStatus(program.status)}
        </span>
        <span
          className="program-card__badge"
          style={{ backgroundColor: progressStyle.bg, color: progressStyle.color }}
        >
          {progressStyle.label}
        </span>
      </div>

      <h3 className="program-card__title">{program.name}</h3>

      <p className="program-card__description">{program.description}</p>

      <Link to={`/programs/${program.programId}`} className="program-card__link">
        View program details &rsaquo;
      </Link>
    </div>
  )
}
