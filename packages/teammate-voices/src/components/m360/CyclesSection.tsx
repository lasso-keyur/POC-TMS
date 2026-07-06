import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { M360Cycle } from '@/types/m360'

interface CyclesSectionProps {
  programId: number
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

type CycleCol = 'name' | 'surveyTitle' | 'versionLabel' | 'participantCount' | 'scheduleStartAt' | 'scheduleEndAt' | 'status'

export default function CyclesSection({ programId }: CyclesSectionProps) {
  const navigate = useNavigate()
  const [cycles, setCycles] = useState<M360Cycle[]>([])
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<M360Cycle | null>(null)
  const [sort, setSort] = useState<{ key: CycleCol; dir: 'asc' | 'desc' } | null>(null)

  const load = useCallback(() => {
    api.getM360Cycles(programId).then(setCycles).catch(() => setCycles([]))
  }, [programId])

  useEffect(() => { load() }, [load])

  // Escape closes the delete confirm + kebab menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDeleteTarget(null); setMenuOpenFor(null) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  async function handleDuplicate(cycle: M360Cycle) {
    setMenuOpenFor(null)
    if (!cycle.cycleId) return
    await api.duplicateM360Cycle(cycle.cycleId)
    load()
  }

  async function confirmDelete() {
    if (!deleteTarget?.cycleId) return
    await api.deleteM360Cycle(deleteTarget.cycleId)
    setDeleteTarget(null)
    load()
  }

  function toggleSort(key: CycleCol) {
    setSort(prev => (prev?.key === key && prev.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }))
  }

  const sortedCycles = sort
    ? [...cycles].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
        return String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true }) * dir
      })
    : cycles

  const header = (label: string, key: CycleCol) => (
    <th>
      <button className="m360-sort-btn" onClick={() => toggleSort(key)}>
        {label}
        <span className={`m360-sort-btn__icon${sort?.key === key ? ' m360-sort-btn__icon--active' : ''}`}>
          {sort?.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </button>
    </th>
  )

  return (
    <div className="m360-cycles-card">
      <div className="m360-cycles-card__header">
        <h3 className="program-detail__card-title">Cycles</h3>
        <button className="m360-add-link" onClick={() => navigate(`/programs/${programId}/cycles/new`)}>
          + Add Cycle
        </button>
      </div>

      {cycles.length === 0 ? (
        <p className="m360-empty">There are currently no reviews associated with this program.</p>
      ) : (
        <table className="m360-cycles-table">
          <thead>
            <tr>
              {header('Cycle name', 'name')}
              {header('Survey', 'surveyTitle')}
              {header('Version', 'versionLabel')}
              {header('Participants', 'participantCount')}
              {header('Schedule start date', 'scheduleStartAt')}
              {header('Schedule end date', 'scheduleEndAt')}
              {header('Status', 'status')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCycles.map(c => (
              <tr key={c.cycleId}>
                <td>
                  <button className="m360-link" onClick={() => navigate(`/programs/${programId}/cycles/${c.cycleId}`)}>
                    {c.name}
                  </button>
                </td>
                <td>{c.surveyTitle ?? <span className="m360-muted">No survey aligned</span>}</td>
                <td>{c.versionLabel ?? '0001'}</td>
                <td>{(c.participantCount ?? 0).toLocaleString()}</td>
                <td>{fmtDate(c.scheduleStartAt ?? c.startDate)}</td>
                <td>{fmtDate(c.scheduleEndAt)}</td>
                <td>{c.status === 'ACTIVE' ? 'Active' : 'Inactive'}</td>
                <td className="m360-cycles-table__actions">
                  <button className="m360-icon-btn" onClick={() => setMenuOpenFor(menuOpenFor === c.cycleId ? null : c.cycleId!)}>⋮</button>
                  {menuOpenFor === c.cycleId && (
                    <div className="m360-kebab-menu">
                      <button onClick={() => handleDuplicate(c)}>Duplicate</button>
                      <button onClick={() => { setMenuOpenFor(null); setDeleteTarget(c) }}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteTarget && (
        <div className="m360-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="m360-modal" onClick={e => e.stopPropagation()}>
            <button className="m360-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
            <div className="m360-modal__warn-icon">⚠</div>
            <h3 className="m360-modal__title">Cycle deletion</h3>
            <p className="m360-modal__body">
              Are you sure you want to delete this cycle? Deleting a cycle can not be undone and all information will be lost.
            </p>
            <div className="m360-modal__footer">
              <button className="m360-btn m360-btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="m360-btn m360-btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
