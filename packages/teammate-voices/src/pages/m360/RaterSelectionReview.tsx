import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { api } from '@/services/api'
import type { M360SelectionView, M360PersonSearchResult, RaterCategory } from '@/types/m360'

const SELECTABLE_RELATIONSHIPS: RaterCategory[] = [
  'DIRECT_REPORTS', 'INDIRECT_MANAGER', 'PEERS', 'BUSINESS_PARTNERS',
]

const RELATIONSHIP_ROW_LABELS: Record<RaterCategory, string> = {
  SELF: 'Self',
  MANAGER: 'Manager',
  INDIRECT_MANAGER: 'Indirect manager',
  PEERS: 'Peers',
  DIRECT_REPORTS: 'Direct report',
  BUSINESS_PARTNERS: 'Business partner',
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING_APPROVAL: { label: 'Pending approval', cls: 'm360-badge--pending' },
    APPROVED:         { label: 'Approved',         cls: 'm360-badge--approved' },
    REJECTED:         { label: 'Rejected',         cls: 'm360-badge--rejected' },
    INVITED:          { label: 'Invited',          cls: 'm360-badge--approved' },
    IN_PROGRESS:      { label: 'In progress',      cls: 'm360-badge--pending' },
    SUBMITTED:        { label: 'Submitted',        cls: 'm360-badge--approved' },
  }
  const cfg = map[status] ?? { label: status, cls: '' }
  return <span className={`m360-badge ${cfg.cls}`}>{cfg.label}</span>
}

function fmtDue(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const days = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000))
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`
}

function fmtRange(startIso?: string | null, endIso?: string | null): string {
  if (!startIso || !endIso) return ''
  const s = new Date(startIso); const e = new Date(endIso)
  const sTxt = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const eTxt = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${sTxt} - ${eTxt}`
}

function criteriaText(view: M360SelectionView): string {
  const parts: string[] = []
  if (view.overallMinRaters != null) parts.push(`Overall minimum: ${view.overallMinRaters}`)
  for (const c of view.criteria) {
    if (c.category === 'SELF' || c.category === 'MANAGER') continue
    if (c.minCount != null && c.maxCount != null) parts.push(`${RELATIONSHIP_ROW_LABELS[c.category]}s: ${c.minCount}-${c.maxCount}`)
    else if (c.maxCount != null) parts.push(`${RELATIONSHIP_ROW_LABELS[c.category]}: <${c.maxCount}`)
  }
  return parts.join('   ')
}

export default function RaterSelectionReview() {
  const { token } = useParams()
  const location = useLocation()
  const kind: 'rater-selection' | 'approval' = location.pathname.includes('/approval/') ? 'approval' : 'rater-selection'

  const [view, setView] = useState<M360SelectionView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [checked, setChecked] = useState<number[]>([])

  // Add rater modal
  const [addOpen, setAddOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchLob, setSearchLob] = useState('')
  const [results, setResults] = useState<M360PersonSearchResult[]>([])
  const [addRelationship, setAddRelationship] = useState<RaterCategory>('PEERS')

  // Reject modal
  const [rejectTargets, setRejectTargets] = useState<number[]>([])
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(() => {
    if (!token) return
    api.getM360SelectionView(kind, token)
      .then(v => { setView(v); setError(null) })
      .catch(e => setError(e instanceof Error ? e.message : 'Unable to load review'))
      .finally(() => setLoading(false))
  }, [kind, token])

  useEffect(() => { load() }, [load])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 4000)
  }

  async function doSearch() {
    if (!token) return
    const r = await api.searchM360People(kind, token, searchName, searchLob)
    setResults(r)
  }

  async function addPerson(person: M360PersonSearchResult) {
    if (!token) return
    try {
      const updated = await api.addM360Rater(kind, token, {
        raterParticipantId: person.participantId,
        raterName: person.fullName,
        raterEmail: person.email,
        relationship: addRelationship,
      })
      setView(updated)
      setResults(prev => prev.filter(p => p.participantId !== person.participantId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add rater')
    }
  }

  async function removeRater(id: number) {
    if (!token) return
    try {
      setView(await api.removeM360Rater(kind, token, id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove rater')
    }
  }

  async function changeRelationship(id: number, relationship: string) {
    if (!token) return
    try {
      setView(await api.updateM360RaterRelationship(kind, token, id, relationship))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update relationship')
    }
  }

  async function approveChecked() {
    if (!token || checked.length === 0) return
    try {
      let updated = view
      for (const id of checked) {
        updated = await api.approveM360Rater(token, id)
      }
      if (updated) setView(updated)
      setChecked([])
      showToast('Selected raters approved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve')
    }
  }

  async function confirmReject() {
    if (!token || rejectTargets.length === 0 || !rejectReason.trim()) return
    try {
      let updated = view
      for (const id of rejectTargets) {
        updated = await api.rejectM360Rater(token, id, rejectReason.trim())
      }
      if (updated) setView(updated)
      setRejectTargets([])
      setRejectReason('')
      setChecked([])
      showToast('Selected raters rejected.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject')
    }
  }

  async function submit() {
    if (!token) return
    try {
      if (kind === 'rater-selection') {
        setView(await api.submitM360Selection(token))
        showToast('Rater selection submitted for manager approval.')
      } else {
        setView(await api.completeM360Approval(token))
        showToast('Rater selection was reviewed and sent back to the user to make updates.')
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed')
    }
  }

  if (loading) return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading review...</p>
  if (!view) return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>{error ?? 'Review not found.'}</p>

  const isApprove = view.mode === 'APPROVE'
  const categoryMet = (cat: RaterCategory): boolean => {
    const c = view.criteria.find(x => x.category === cat)
    if (!c?.minCount) return true
    const count = view.raters.filter(r => r.relationship === cat && r.status !== 'REJECTED').length
    return count >= c.minCount
  }
  const activeCount = view.raters.filter(r => r.status !== 'REJECTED').length
  const overallMet = view.overallMinRaters == null || activeCount >= view.overallMinRaters

  return (
    <div className="m360-review">
      <header className="m360-review__topbar">
        <span className="m360-review__brand">TEAMMATE VOICES</span>
        <span className="m360-review__brand-sub">Employee Survey</span>
      </header>

      <div className="m360-review__body">
        <nav className="m360-review__breadcrumb">Home &rsaquo; <strong>Rater selection review</strong></nav>
        <h1 className="m360-review__title">Rater selection review</h1>

        {toast && (
          <div className="m360-toast">
            <span className="m360-toast__icon">✓</span>
            <div><strong>Success!</strong><p>{toast}</p></div>
            <button className="m360-toast__close" onClick={() => setToast(null)}>✕</button>
          </div>
        )}
        {error && (
          <div className="m360-error-banner">
            <span className="m360-error-banner__icon">⚠</span>
            <div><strong>Something needs attention</strong><p>{error}</p></div>
          </div>
        )}

        {/* Profile header card */}
        <div className="m360-profile-card">
          <div className="m360-profile-card__left">
            <div className="m360-profile-card__avatar">
              {(view.participantName ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="m360-profile-card__name">{view.participantName ?? view.participantId}</h2>
              <p className="m360-profile-card__meta">{view.participantTitle ?? ''}</p>
              <p className="m360-profile-card__meta m360-profile-card__meta--org">{view.participantOrg ?? ''}</p>
              <p className="m360-profile-card__meta">Employee</p>
            </div>
          </div>
          <div className="m360-profile-card__right">
            <div>
              <span className="m360-profile-card__label">Due date</span>
              <span className="m360-profile-card__value">{fmtDue(view.dueDate)}</span>
            </div>
            <div>
              <span className="m360-profile-card__label">{view.reviewLabel ?? 'Review 1'}</span>
              <span className="m360-profile-card__value">{fmtRange(view.windowStartAt, view.windowEndAt)}</span>
            </div>
            <div>
              <span className="m360-profile-card__label">Status</span>
              <span className="m360-badge m360-badge--pending">{view.enrollmentStatus.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* 360 Raters card */}
        <div className="m360-raters-card">
          <h3 className="m360-raters-card__title">360 Raters</h3>

          <div className="m360-info-banner">
            <span className="m360-info-banner__icon">ⓘ</span>
            <div>
              The minimum criteria below is required. Managers are able to view/edit the rater list only during rater approval.
              <div className="m360-info-banner__criteria">{criteriaText(view)}</div>
            </div>
          </div>

          <div className="m360-raters-card__controls">
            <div className="m360-criteria-checks">
              {view.overallMinRaters != null && (
                <span className={`m360-criteria-check${overallMet ? ' m360-criteria-check--met' : ''}`}>
                  Overall minimum: {overallMet ? '✓' : '•'}
                </span>
              )}
              {(['DIRECT_REPORTS', 'PEERS', 'BUSINESS_PARTNERS', 'INDIRECT_MANAGER'] as RaterCategory[]).map(cat => (
                <span key={cat} className={`m360-criteria-check${categoryMet(cat) ? ' m360-criteria-check--met' : ''}`}>
                  {RELATIONSHIP_ROW_LABELS[cat]}s: {categoryMet(cat) ? '✓' : '•'}
                </span>
              ))}
            </div>
            <div className="m360-raters-card__actions">
              {isApprove && (
                <>
                  <button className="m360-add-link" onClick={approveChecked} disabled={checked.length === 0}>✓ Approve</button>
                  <button className="m360-add-link" onClick={() => checked.length > 0 && setRejectTargets(checked)} disabled={checked.length === 0}>⊘ Reject</button>
                </>
              )}
              <button className="m360-add-link" onClick={() => { setAddOpen(true); doSearch() }}>+ Add raters</button>
            </div>
          </div>

          <table className="m360-raters-table">
            <thead>
              <tr>
                {isApprove && <th className="m360-raters-table__check"></th>}
                <th>Rater name</th>
                <th>Relationship</th>
                <th>Added by</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {view.raters.map(r => {
                const system = r.addedBy === 'SYSTEM'
                return (
                  <tr key={r.raterAssignmentId}>
                    {isApprove && (
                      <td className="m360-raters-table__check">
                        {!system && (
                          <input
                            type="checkbox"
                            checked={checked.includes(r.raterAssignmentId)}
                            onChange={e => setChecked(prev => e.target.checked
                              ? [...prev, r.raterAssignmentId]
                              : prev.filter(id => id !== r.raterAssignmentId))}
                          />
                        )}
                      </td>
                    )}
                    <td>
                      <span className="m360-raters-table__avatar">👤</span>
                      {r.raterName}
                    </td>
                    <td>
                      {system ? RELATIONSHIP_ROW_LABELS[r.relationship] : (
                        <select
                          className="program-create__select m360-raters-table__rel"
                          value={r.relationship}
                          onChange={e => changeRelationship(r.raterAssignmentId, e.target.value)}
                        >
                          {SELECTABLE_RELATIONSHIPS.map(rel => (
                            <option key={rel} value={rel}>{RELATIONSHIP_ROW_LABELS[rel]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{system ? 'System' : r.addedBy === 'SELF' ? 'Self' : r.addedBy === 'MANAGER' ? 'Manager' : 'HR Partner'}</td>
                    <td>
                      {statusBadge(r.status)}
                      {r.status === 'REJECTED' && r.rejectionReason && (
                        <div className="m360-muted" title={r.rejectionReason}>“{r.rejectionReason.substring(0, 60)}{r.rejectionReason.length > 60 ? '…' : ''}”</div>
                      )}
                    </td>
                    <td>
                      {!system && (
                        <button className="m360-icon-btn" title="Remove" onClick={() => removeRater(r.raterAssignmentId)}>🗑</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="m360-review__footer">
            <button className="m360-btn m360-btn--link" onClick={load}>Cancel</button>
            <button className="m360-btn m360-btn--secondary" onClick={() => showToast('Progress saved.')}>Save</button>
            <button className="m360-btn m360-btn--primary" onClick={submit}>Submit</button>
          </div>
        </div>
      </div>

      {/* Add raters modal */}
      {addOpen && (
        <div className="m360-modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="m360-modal m360-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="m360-modal__close" onClick={() => setAddOpen(false)}>✕</button>
            <h3 className="m360-modal__title" style={{ textAlign: 'left' }}>Add raters</h3>
            <div className="m360-add-search">
              <input className="program-create__input" placeholder="Search by name" value={searchName}
                onChange={e => setSearchName(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
              <input className="program-create__input" placeholder="LOB" value={searchLob}
                onChange={e => setSearchLob(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
              <select className="program-create__select" value={addRelationship} onChange={e => setAddRelationship(e.target.value as RaterCategory)}>
                {SELECTABLE_RELATIONSHIPS.map(rel => <option key={rel} value={rel}>{RELATIONSHIP_ROW_LABELS[rel]}</option>)}
              </select>
              <button className="m360-btn m360-btn--secondary" onClick={doSearch}>Search</button>
            </div>
            <div className="m360-add-results">
              {results.length === 0 && <p className="m360-empty">No people found. Adjust the search.</p>}
              {results.map(p => (
                <div key={p.participantId} className="m360-add-results__row">
                  <div>
                    <strong>{p.fullName}</strong>
                    <span className="m360-muted"> — {p.email}{p.lineOfBusiness ? ` · ${p.lineOfBusiness}` : ''}</span>
                  </div>
                  <button className="m360-btn m360-btn--secondary m360-btn--sm" onClick={() => addPerson(p)}>Add</button>
                </div>
              ))}
            </div>
            <div className="m360-modal__footer">
              <button className="m360-btn m360-btn--primary" onClick={() => setAddOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectTargets.length > 0 && (
        <div className="m360-modal-overlay" onClick={() => setRejectTargets([])}>
          <div className="m360-modal" onClick={e => e.stopPropagation()}>
            <button className="m360-modal__close" onClick={() => setRejectTargets([])}>✕</button>
            <h3 className="m360-modal__title">Reject rater{rejectTargets.length > 1 ? 's' : ''}</h3>
            <p className="m360-modal__body">Provide a reason for the rejection. The participant will see this when updating their selection.</p>
            <textarea
              className="m360-modal__textarea"
              rows={4}
              maxLength={1000}
              placeholder="Reason for rejection (required)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="m360-muted" style={{ textAlign: 'right' }}>{1000 - rejectReason.length} characters remaining</div>
            <div className="m360-modal__footer">
              <button className="m360-btn m360-btn--secondary" onClick={() => setRejectTargets([])}>Cancel</button>
              <button className="m360-btn m360-btn--danger" onClick={confirmReject} disabled={!rejectReason.trim()}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
