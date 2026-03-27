import { useState, useEffect, useCallback } from 'react'
import { Button, Input } from '../design-system'
import { api } from '@/services/api'
import type { Participant, Dispatch } from '@/types/participant'

interface DistributeTabProps {
  surveyId: number
  surveyTitle: string
  isActive: boolean   // survey must be ACTIVE to dispatch
}

// Status badge config matching ProgramDetail colours
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUBMITTED: { label: 'Completed', color: '#166534', bg: '#dcfce7' },
  SENT:      { label: 'Sent',      color: '#1e40af', bg: '#dbeafe' },
  OPENED:    { label: 'Opened',    color: '#0e7490', bg: '#cffafe' },
  PENDING:   { label: 'Pending',   color: '#6b7280', bg: '#f3f4f6' },
  FAILED:    { label: 'Failed',    color: '#dc2626', bg: '#fef2f2' },
  EXPIRED:   { label: 'Expired',   color: '#d97706', bg: '#fefce8' },
}

function fmt(dt: string | null | undefined): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DistributeTab({ surveyId, surveyTitle, isActive }: DistributeTabProps) {
  // ----- Participants -----
  const [participants, setParticipants] = useState<Participant[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingParts, setLoadingParts] = useState(true)

  // ----- Ad-hoc emails -----
  const [adhocEmails, setAdhocEmails] = useState('')

  // ----- Scheduled send -----
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  // ----- Send state -----
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ created: number; emailsSent: number; skipped: number; errors: string[] } | null>(null)
  const [sendError, setSendError] = useState('')

  // ----- Dispatch history -----
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // ----- Copy link -----
  const surveyLink = `${window.location.origin}/survey/${surveyId}/respond`
  const [copied, setCopied] = useState(false)

  // Load participants and dispatch history on mount
  useEffect(() => {
    api.getParticipants()
      .then(setParticipants)
      .catch(() => {})
      .finally(() => setLoadingParts(false))
  }, [])

  const loadHistory = useCallback(() => {
    setLoadingHistory(true)
    api.getDispatchesBySurvey(surveyId)
      .then(setDispatches)
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [surveyId])

  useEffect(() => { loadHistory() }, [loadHistory])

  // Filtered participant list
  const filtered = participants.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(p => p.participantId)))
    }
  }

  const handleSend = async () => {
    const emails = adhocEmails
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'))

    if (selected.size === 0 && emails.length === 0) {
      setSendError('Select at least one participant or enter an email address.')
      return
    }

    setSending(true)
    setSendResult(null)
    setSendError('')

    try {
      const result = await api.adHocDispatch(
        surveyId,
        Array.from(selected),
        emails,
        scheduleEnabled && scheduledAt ? scheduledAt : undefined
      )
      setSendResult(result)
      setSelected(new Set())
      setAdhocEmails('')
      loadHistory()
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Send failed. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(surveyLink)}`

  // Already-dispatched participant IDs for this survey
  const dispatchedIds = new Set(dispatches.map(d => d.participantId).filter(Boolean))

  return (
    <div className="dist-tab">

      <div className="dist-tab__heading">
        <h2 className="dist-tab__title">Distribute — <span>{surveyTitle}</span></h2>
        <p className="dist-tab__subtitle">Send this survey to participants or share via link.</p>
      </div>

      {/* ── Survey not active warning ── */}
      {!isActive && (
        <div className="dist-tab__notice dist-tab__notice--warn">
          <span>⚠️</span>
          <span>
            This survey is not <strong>Active</strong>. Publish &amp; activate it before sending.
            You can still copy the share link below.
          </span>
        </div>
      )}

      <div className="dist-tab__grid">

        {/* ════════════════════════════════
            LEFT COLUMN — Send Now
            ════════════════════════════════ */}
        <div className="dist-tab__col dist-tab__col--send">

          {/* Section: Select Participants */}
          <section className="dist-section">
            <div className="dist-section__header">
              <h3 className="dist-section__title">Select Recipients</h3>
              <span className="dist-section__badge">{selected.size} selected</span>
            </div>

            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
            />

            <div className="dist-participant-list">
              {loadingParts ? (
                <p className="dist-empty">Loading participants…</p>
              ) : filtered.length === 0 ? (
                <p className="dist-empty">No participants found.</p>
              ) : (
                <>
                  {/* Select all row */}
                  <label className="dist-participant-row dist-participant-row--header">
                    <input
                      type="checkbox"
                      className="dist-participant-row__check"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                    />
                    <span className="dist-participant-row__name" style={{ fontWeight: 600, color: '#1d1d1f' }}>
                      Select all ({filtered.length})
                    </span>
                  </label>

                  {filtered.map(p => {
                    const alreadySent = dispatchedIds.has(p.participantId)
                    return (
                      <label key={p.participantId} className={`dist-participant-row${alreadySent ? ' dist-participant-row--sent' : ''}`}>
                        <input
                          type="checkbox"
                          className="dist-participant-row__check"
                          checked={selected.has(p.participantId)}
                          onChange={() => toggleSelect(p.participantId)}
                          disabled={alreadySent}
                        />
                        <span className="dist-participant-row__avatar">
                          {p.fullName.charAt(0).toUpperCase()}
                        </span>
                        <span className="dist-participant-row__info">
                          <span className="dist-participant-row__name">{p.fullName}</span>
                          <span className="dist-participant-row__email">{p.email}</span>
                        </span>
                        {alreadySent && (
                          <span className="dist-participant-row__sent-pill">Sent</span>
                        )}
                      </label>
                    )
                  })}
                </>
              )}
            </div>
          </section>

          {/* Section: Ad-hoc emails */}
          <section className="dist-section">
            <h3 className="dist-section__title">Add Ad-hoc Emails</h3>
            <p className="dist-section__sub">People not in the participant database. Separate by comma, semicolon, or new line.</p>
            <textarea
              className="dist-adhoc-textarea"
              placeholder="e.g. jane@acme.com, bob@acme.com"
              value={adhocEmails}
              onChange={e => setAdhocEmails(e.target.value)}
              rows={3}
            />
          </section>

          {/* Section: Schedule (optional) */}
          <section className="dist-section">
            <div className="dist-schedule-toggle">
              <label className="dist-schedule-toggle__label">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={e => setScheduleEnabled(e.target.checked)}
                  className="dist-schedule-toggle__check"
                />
                Schedule for later
              </label>
            </div>
            {scheduleEnabled && (
              <input
                type="datetime-local"
                className="dist-datetime-input"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </section>

          {/* Send result banner */}
          {sendResult && (
            <div className="dist-tab__notice dist-tab__notice--success">
              <span>✅</span>
              <span>
                <strong>{sendResult.created} sent</strong>
                {sendResult.skipped > 0 && `, ${sendResult.skipped} skipped (already sent)`}
                {sendResult.errors.length > 0 && `, ${sendResult.errors.length} failed`}
              </span>
            </div>
          )}
          {sendError && (
            <div className="dist-tab__notice dist-tab__notice--error">
              <span>❌</span><span>{sendError}</span>
            </div>
          )}

          <div className="dist-send-footer">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              loading={sending}
              disabled={!isActive || sending}
            >
              {scheduleEnabled && scheduledAt ? '⏰ Schedule Send' : '⚡ Send Now'}
            </Button>
            {!isActive && (
              <span className="dist-send-footer__hint">Activate the survey to enable sending</span>
            )}
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT COLUMN — Share + History
            ════════════════════════════════ */}
        <div className="dist-tab__col dist-tab__col--right">

          {/* Share link */}
          <section className="dist-section">
            <h3 className="dist-section__title">Share Link</h3>
            <p className="dist-section__sub">Anyone with this link can take the survey anonymously.</p>
            <div className="dist-link-row">
              <input
                readOnly
                className="dist-link-input"
                value={surveyLink}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button className="dist-copy-btn" onClick={handleCopyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* QR Code */}
            <div className="dist-qr-wrap">
              <img
                src={qrUrl}
                alt="Survey QR code"
                className="dist-qr-img"
                width={160}
                height={160}
              />
              <div className="dist-qr-meta">
                <p className="dist-qr-meta__title">QR Code</p>
                <p className="dist-qr-meta__sub">Print or embed in materials — respondents scan to open the survey.</p>
                <a
                  href={qrUrl}
                  download={`qr-${surveyId}.png`}
                  className="dist-qr-download"
                  target="_blank"
                  rel="noreferrer"
                >
                  ↓ Download QR
                </a>
              </div>
            </div>
          </section>

          {/* Dispatch History */}
          <section className="dist-section">
            <div className="dist-section__header">
              <h3 className="dist-section__title">Dispatch History</h3>
              <button className="dist-refresh-btn" onClick={loadHistory} disabled={loadingHistory}>
                {loadingHistory ? 'Refreshing…' : '↻ Refresh'}
              </button>
            </div>

            {loadingHistory ? (
              <p className="dist-empty">Loading…</p>
            ) : dispatches.length === 0 ? (
              <p className="dist-empty">No dispatches yet for this survey.</p>
            ) : (
              <div className="dist-history-table-wrap">
                <table className="dist-history-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Status</th>
                      <th>Sent</th>
                      <th>Opened</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.map(d => {
                      const participant = participants.find(p => p.participantId === d.participantId)
                      const statusCfg = STATUS_CONFIG[d.dispatchStatus] || STATUS_CONFIG['PENDING']
                      return (
                        <tr key={d.dispatchId}>
                          <td>
                            {participant ? (
                              <div className="dist-history-recipient">
                                <span className="dist-history-recipient__name">{participant.fullName}</span>
                                <span className="dist-history-recipient__email">{participant.email}</span>
                              </div>
                            ) : (
                              <span className="dist-history-recipient__email">Ad-hoc recipient</span>
                            )}
                          </td>
                          <td>
                            <span className="dist-history-status" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="dist-history-date">{fmt(d.sentAt)}</td>
                          <td className="dist-history-date">{fmt(d.openedAt)}</td>
                          <td className="dist-history-date">{fmt(d.submittedAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
