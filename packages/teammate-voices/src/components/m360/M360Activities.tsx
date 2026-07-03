import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { M360Activity, M360AvailableReport } from '@/types/m360'

type ActivityTab = 'pending' | 'completed'
type SortDir = 'asc' | 'desc'

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

interface SortState<K extends string> { key: K; dir: SortDir }

function SortHeader<K extends string>({ label, colKey, sort, onSort }: {
  label: string
  colKey: K
  sort: SortState<K> | null
  onSort: (key: K) => void
}) {
  const active = sort?.key === colKey
  return (
    <th>
      <button className="m360-sort-btn" onClick={() => onSort(colKey)}>
        {label}
        <span className={`m360-sort-btn__icon${active ? ' m360-sort-btn__icon--active' : ''}`}>
          {active ? (sort!.dir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </button>
    </th>
  )
}

type ActivityCol = 'activity' | 'surveyName' | 'cycleName' | 'participantName' | 'myRole' | 'dueDate' | 'status'
type ReportCol = 'report' | 'surveyName' | 'cycleName' | 'datePublished'

export default function M360Activities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<M360Activity[]>([])
  const [reports, setReports] = useState<M360AvailableReport[]>([])
  const [tab, setTab] = useState<ActivityTab>('pending')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState<ActivityCol> | null>(null)
  const [reportSort, setReportSort] = useState<SortState<ReportCol> | null>(null)
  const pageSize = 10

  useEffect(() => {
    api.getM360Activities().then(setActivities).catch(() => setActivities([]))
    api.getM360AvailableReports().then(setReports).catch(() => setReports([]))
  }, [])

  function toggleSort(key: ActivityCol) {
    setSort(prev => (prev?.key === key && prev.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }))
  }

  function toggleReportSort(key: ReportCol) {
    setReportSort(prev => (prev?.key === key && prev.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }))
  }

  const filtered = useMemo(() => {
    const rows = activities.filter(a => (tab === 'completed' ? a.completed : !a.completed))
    if (!sort) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * dir)
  }, [activities, tab, sort])

  const sortedReports = useMemo(() => {
    if (!reportSort) return reports
    const dir = reportSort.dir === 'asc' ? 1 : -1
    return [...reports].sort((a, b) =>
      String(a[reportSort.key] ?? '').localeCompare(String(b[reportSort.key] ?? '')) * dir)
  }, [reports, reportSort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (activities.length === 0 && reports.length === 0) return null

  return (
    <>
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
              <SortHeader label="Activity" colKey="activity" sort={sort} onSort={toggleSort} />
              <SortHeader label="Survey" colKey="surveyName" sort={sort} onSort={toggleSort} />
              <SortHeader label="Cycle" colKey="cycleName" sort={sort} onSort={toggleSort} />
              <SortHeader label="Participant" colKey="participantName" sort={sort} onSort={toggleSort} />
              <SortHeader label="My acting role" colKey="myRole" sort={sort} onSort={toggleSort} />
              <SortHeader label="Due date" colKey="dueDate" sort={sort} onSort={toggleSort} />
              <SortHeader label="Status" colKey="status" sort={sort} onSort={toggleSort} />
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

      {reports.length > 0 && (
        <div className="m360-activities">
          <div className="m360-activities__header-row">
            <div>
              <h2 className="m360-activities__title">Available reports</h2>
              <span className="m360-muted">Published the last 60 days</span>
            </div>
            <div className="m360-activities__header-links">
              <span className="m360-muted">Looking for more reports?</span>
              <button className="m360-add-link" onClick={() => navigate('/reports')}>Historical reports</button>
              <span className="m360-muted">|</span>
              <button className="m360-add-link" onClick={() => navigate('/reports')}>ESAT dashboard</button>
            </div>
          </div>

          <table className="m360-activities-list">
            <thead>
              <tr>
                <SortHeader label="Report" colKey="report" sort={reportSort} onSort={toggleReportSort} />
                <SortHeader label="Survey" colKey="surveyName" sort={reportSort} onSort={toggleReportSort} />
                <SortHeader label="Cycle" colKey="cycleName" sort={reportSort} onSort={toggleReportSort} />
                <SortHeader label="Date published" colKey="datePublished" sort={reportSort} onSort={toggleReportSort} />
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((r, i) => (
                <tr key={i}>
                  <td>
                    <button className="m360-link" onClick={() => navigate(r.linkPath)}>{r.report}</button>
                  </td>
                  <td>{r.surveyName}</td>
                  <td>{r.cycleName}</td>
                  <td>{fmtDate(r.datePublished)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
