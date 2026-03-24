import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../design-system'
import Breadcrumb from '@/components/Breadcrumb'
import StatusPill from '@/components/StatusPill'

function getStatusVariant(status: string): 'active' | 'draft' | 'closed' | 'default' {
  const s = status.toUpperCase()
  if (s === 'ACTIVE') return 'active'
  if (s === 'INACTIVE') return 'draft'
  if (s === 'CLOSED') return 'closed'
  return 'default'
}
import { api } from '@/services/api'
import type { ProgramDetail as ProgramDetailType, ParticipantStatusRow } from '@/types/program'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUBMITTED:  { label: 'Completed',       color: '#166534', bg: '#dcfce7' },
  SENT:       { label: 'Sent',            color: '#1e40af', bg: '#dbeafe' },
  OPENED:     { label: 'Opened',          color: '#1e40af', bg: '#dbeafe' },
  PENDING:    { label: 'Pending',         color: '#6b7280', bg: '#f3f4f6' },
  FAILED:     { label: 'Failed',          color: '#dc2626', bg: '#fef2f2' },
  EXPIRED:    { label: 'Expired',         color: '#d97706', bg: '#fefce8' },
}

const DEFAULT_STATUS = { label: 'Not Dispatched', color: '#9ca3af', bg: '#f9fafb' }

function DispatchStatusPill({ status }: { status: string | null }) {
  const cfg = status ? STATUS_CONFIG[status] || DEFAULT_STATUS : DEFAULT_STATUS
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      color: cfg.color,
      background: cfg.bg,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

export default function ProgramDetail() {
  const { programId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<ProgramDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!programId) return
    api.getProgramDetail(Number(programId))
      .then(setDetail)
      .catch(() => navigate('/programs'))
      .finally(() => setLoading(false))
  }, [programId, navigate])

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading program...</p>
  }

  if (!detail) {
    return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Program not found.</p>
  }

  const { program, participants, totalParticipants, completedCount, sentCount, pendingCount } = detail

  // Filter participants
  const filtered = participants.filter((p: ParticipantStatusRow) => {
    const matchSearch = !search ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.cohort || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'NOT_DISPATCHED' && !p.dispatchStatus) ||
      p.dispatchStatus === statusFilter
    return matchSearch && matchStatus
  })

  const progressLabel = (program.surveyProgress || 'NOT_STARTED').replace(/_/g, ' ')

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Programs', path: '/programs' },
        { label: program.name },
      ]} />

      <div className="program-detail__header">
        <div>
          <h1 className="program-detail__title">{program.name}</h1>
          <div className="program-detail__meta">
            <StatusPill label={program.status} variant={getStatusVariant(program.status)} />
            <span className="program-detail__progress-badge" data-progress={program.surveyProgress}>
              {progressLabel}
            </span>
          </div>
        </div>
        <div className="program-detail__actions">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/programs/${programId}/edit`)}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/programs')}>
            Back
          </Button>
        </div>
      </div>

      {/* Top Card: Program Information */}
      <div className="program-detail__info-card">
        <h3 className="program-detail__card-title">Program Information</h3>
        <div className="program-detail__info-grid">
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Template Type</span>
            <span className="program-detail__info-value">{program.templateType || '—'}</span>
          </div>
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Program Name</span>
            <span className="program-detail__info-value">{program.name}</span>
          </div>
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Status</span>
            <span className="program-detail__info-value"><StatusPill label={program.status} variant={getStatusVariant(program.status)} /></span>
          </div>
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Survey Progress</span>
            <span className="program-detail__info-value">{progressLabel}</span>
          </div>
          <div className="program-detail__info-item program-detail__info-item--full">
            <span className="program-detail__info-label">Description</span>
            <span className="program-detail__info-value">{program.description || '—'}</span>
          </div>
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Created</span>
            <span className="program-detail__info-value">
              {program.createdAt ? new Date(program.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
          <div className="program-detail__info-item">
            <span className="program-detail__info-label">Last Updated</span>
            <span className="program-detail__info-value">
              {program.updatedAt ? new Date(program.updatedAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="program-detail__metrics">
          <div className="program-detail__metric">
            <span className="program-detail__metric-value">{totalParticipants}</span>
            <span className="program-detail__metric-label">Total</span>
          </div>
          <div className="program-detail__metric program-detail__metric--green">
            <span className="program-detail__metric-value">{completedCount}</span>
            <span className="program-detail__metric-label">Completed</span>
          </div>
          <div className="program-detail__metric program-detail__metric--blue">
            <span className="program-detail__metric-value">{sentCount}</span>
            <span className="program-detail__metric-label">Sent</span>
          </div>
          <div className="program-detail__metric program-detail__metric--gray">
            <span className="program-detail__metric-value">{pendingCount}</span>
            <span className="program-detail__metric-label">Pending</span>
          </div>
        </div>
      </div>

      {/* Bottom Card: Participants Grid */}
      <div className="program-detail__participants-card">
        <div className="program-detail__participants-header">
          <h3 className="program-detail__card-title">
            Participants ({filtered.length}{filtered.length !== totalParticipants ? ` of ${totalParticipants}` : ''})
          </h3>
          <div className="program-detail__filters">
            <input
              className="program-detail__search"
              type="text"
              placeholder="Search by name, email, cohort..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="program-detail__status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Completed</option>
              <option value="SENT">Sent</option>
              <option value="OPENED">Opened</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
              <option value="NOT_DISPATCHED">Not Dispatched</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="program-detail__empty">
            {totalParticipants === 0
              ? 'No participants in this program yet.'
              : 'No participants match the current filter.'}
          </p>
        ) : (
          <div className="program-detail__table-wrap">
            <table className="program-detail__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Cohort</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Reminders</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: ParticipantStatusRow) => (
                  <tr key={p.participantId} className={!p.active ? 'program-detail__row--inactive' : ''}>
                    <td className="program-detail__cell-name">{p.fullName}</td>
                    <td>{p.email}</td>
                    <td>{p.cohort || '—'}</td>
                    <td>
                      <span className="program-detail__type-badge">
                        {p.participantType === 'NEW_HIRE' ? 'New Hire' : p.participantType === 'EXISTING_RESOURCE' ? 'Existing' : p.participantType || '—'}
                      </span>
                    </td>
                    <td><DispatchStatusPill status={p.dispatchStatus} /></td>
                    <td>{p.surveyStage ? p.surveyStage.replace(/_/g, ' ') : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{p.reminderCount > 0 ? p.reminderCount : '—'}</td>
                    <td>
                      {p.submittedAt
                        ? new Date(p.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
