import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Program } from '@/types/program'

interface ProgramCardProps {
  program: Program
  onEdit?: (programId: number) => void
  onDelete?: (programId: number) => void
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

export default function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const progressStyle = PROGRESS_STYLES[program.surveyProgress] || PROGRESS_STYLES['Not started']

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleToggleMenu = () => {
    if (!menuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 140 })
    }
    setMenuOpen(prev => !prev)
  }

  return (
    <div
      className="program-card"
      style={{
        background: '#f5f5f7',
        border: 'none',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Actions menu trigger */}
      <button
        ref={triggerRef}
        className="program-card__menu-trigger"
        onClick={handleToggleMenu}
        title="Actions"
      >
        ⋮
      </button>

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          className="program-card__menu-dropdown"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            className="program-card__menu-item"
            onClick={() => {
              setMenuOpen(false)
              onEdit?.(program.programId)
            }}
          >
            Edit
          </button>
          <button
            className="program-card__menu-item program-card__menu-item--danger"
            onClick={() => {
              setMenuOpen(false)
              onDelete?.(program.programId)
            }}
          >
            Delete
          </button>
        </div>,
        document.body,
      )}

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
