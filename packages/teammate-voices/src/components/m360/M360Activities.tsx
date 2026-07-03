import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { M360Activity } from '@/types/m360'

type ActivityTab = 'pending' | 'completed'

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function statusClass(status: string): string {
  if (status === 'Insufficient raters') return 'm360-badge--rejected'
  if (status === 'In progress') return 'm360-badge--info'
  if (status === 'Completed') return 'm360-badge--approved'
  return 'm360-badge--neutral'
}

export default function M360Activities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<M360Activity[]>([])
  const [tab, setTab] = useState<ActivityTab>('pending')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    api.getM360Activities().then(setActivities).catch(() => setActivities([]))
  }, [])

  const filtered = useMemo(
    () => activities.filter(a => (tab === 'completed' ? a.completed : !a.completed)),
    [activities, tab],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (activities.length === 0) return null

  return (
    <div className="m360-activities">
      <h2 className="m360-activities__title">Activities</h2>

      <div className="m360-activities__tabs">
        {(['pending', 'completed'] as ActivityTab[]).map(t => (
          <button
            key={t}
            className={`m360-activities__tab${tab === t ? ' m360-activities__tab--active' : ''}`}
            onClick={() => { setTab(t); setPage(1) }}
          >
            {t === 'pending' ? 'Pending' : 'Completed'}
          </button>
        ))}
      </div>

      <table className="m360-activities-list">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Survey</th>
            <th>Cycle</th>
            <th>Participant</th>
            <th>My acting role</th>
            <th>Due date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((a, i) => (
            <tr key={i}>
              <td>
                <button className="m360-link" onClick={() => navigate(a.linkPath)}>{a.activity}</button>
              </td>
              <td>{a.surveyName}</td>
              <td>{a.cycleName}</td>
              <td>{a.participantName}</td>
              <td>{a.myRole}</td>
              <td>{fmtDate(a.dueDate)}</td>
              <td><span className={`m360-badge ${statusClass(a.status)}`}>{a.status}</span></td>
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr><td colSpan={7} className="m360-empty">No {tab} activities.</td></tr>
          )}
        </tbody>
      </table>

      {filtered.length > pageSize && (
        <div className="m360-activities__pagination">
          <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <div>
            <span>Page </span>
            <select value={page} onChange={e => setPage(Number(e.target.value))}>
              {Array.from({ length: pageCount }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
            <button className="m360-add-link" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="m360-add-link" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
