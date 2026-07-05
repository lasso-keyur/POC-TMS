import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '@/components/Breadcrumb'
import { api } from '@/services/api'
import type { M360Report, M360GapRow, ReportCategory } from '@/types/m360'
import { RATER_CATEGORY_LABELS } from '@/types/m360'

const CATEGORY_COLORS: Record<string, string> = {
  SELF: '#012169',
  MANAGER: '#4a6fb5',
  PEERS: '#7f9ed1',
  DIRECT_REPORTS: '#c0392b',
  BUSINESS_PARTNERS: '#e67e22',
  INDIRECT_MANAGER: '#6b7280',
  OTHERS: '#8c8a85',
}

function categoryLabel(category: ReportCategory): string {
  if (category === 'OTHERS') return 'Others'
  return RATER_CATEGORY_LABELS[category] ?? category
}

const GAP_META: Record<M360GapRow['classification'], { label: string; cls: string; hint: string }> = {
  BLIND_SPOT: {
    label: 'Blind spot',
    cls: 'm360-gap-chip--blind',
    hint: 'Rated notably higher by self than by others',
  },
  HIDDEN_STRENGTH: {
    label: 'Hidden strength',
    cls: 'm360-gap-chip--hidden',
    hint: 'Rated notably higher by others than by self',
  },
  ALIGNED: {
    label: 'Aligned',
    cls: 'm360-gap-chip--aligned',
    hint: 'Self-perception matches how others see it',
  },
}

export default function CycleReport() {
  const { cycleId, participantId } = useParams()
  const [report, setReport] = useState<M360Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cycleId || !participantId) return
    api.getM360Report(Number(cycleId), participantId)
      .then(setReport)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false))
  }, [cycleId, participantId])

  if (loading) return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading report...</p>
  if (!report) return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>{error ?? 'Report not found.'}</p>

  const maxScore = 5
  const flagged = report.gapRows.filter(g => g.classification !== 'ALIGNED')
  const aligned = report.gapRows.filter(g => g.classification === 'ALIGNED')

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Programs', path: '/programs' },
        { label: report.cycleName },
        { label: `360 Report — ${report.participantName ?? report.participantId}` },
      ]} />

      <h1 className="program-detail__title" style={{ marginBottom: 4 }}>360 Report</h1>
      <p className="m360-muted" style={{ marginBottom: 24 }}>
        {report.participantName ?? report.participantId} · {report.cycleName}
      </p>

      <div className="m360-report-card">
        <h3 className="program-detail__card-title">Average score by rater group</h3>
        {report.categoryScores.length === 0 ? (
          <p className="m360-empty">No feedback responses have been submitted yet.</p>
        ) : (
          <div className="m360-report-bars">
            {report.categoryScores.map(c => (
              <div key={c.category} className="m360-report-bar">
                <span className="m360-report-bar__label">
                  {categoryLabel(c.category)}
                  <span className="m360-muted"> ({c.responseCount} response{c.responseCount === 1 ? '' : 's'})</span>
                </span>
                <div className="m360-report-bar__track">
                  <div
                    className="m360-report-bar__fill"
                    style={{
                      width: `${Math.min(100, (c.avgScore / maxScore) * 100)}%`,
                      background: CATEGORY_COLORS[c.category] ?? '#012169',
                    }}
                  />
                </div>
                <span className="m360-report-bar__score">{c.avgScore.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {report.suppressedCategories.length > 0 && (
          <div className="m360-anon-note">
            <span className="m360-anon-note__icon">🔒</span>
            <div>
              <strong>Protected for anonymity.</strong>{' '}
              {report.suppressedCategories.map((s, i) => (
                <span key={s.category}>
                  {i > 0 && ' · '}
                  {categoryLabel(s.category)} ({s.responseCount} of {s.minimumRequired} minimum responses)
                </span>
              ))}
              <div className="m360-muted">
                Rater groups appear once at least {report.anonymityMinimum} people respond, so no individual answer can be identified.
              </div>
            </div>
          </div>
        )}
      </div>

      {report.gapRows.length > 0 && (
        <div className="m360-report-card">
          <h3 className="program-detail__card-title">Blind spots &amp; hidden strengths</h3>
          <p className="m360-muted" style={{ margin: '0 0 16px' }}>
            How self-ratings compare against the average of all other raters. Differences of 1.0 or more are flagged.
          </p>

          <div className="m360-gap-legend">
            <span><span className="m360-gap-dot m360-gap-dot--self" /> Self</span>
            <span><span className="m360-gap-dot m360-gap-dot--others" /> Others average</span>
          </div>

          {[...flagged, ...aligned].map(g => {
            const meta = GAP_META[g.classification]
            const selfPct = (g.selfScore / maxScore) * 100
            const othersPct = (g.othersAvg / maxScore) * 100
            return (
              <div key={g.questionId} className="m360-gap-row">
                <div className="m360-gap-row__head">
                  <span className="m360-gap-row__question">{g.questionText ?? `Question ${g.questionId}`}</span>
                  <span className={`m360-gap-chip ${meta.cls}`} title={meta.hint}>
                    {meta.label}{g.classification !== 'ALIGNED' && ` (${g.delta > 0 ? '+' : ''}${g.delta.toFixed(1)})`}
                  </span>
                </div>
                <div className="m360-gap-track">
                  <div
                    className="m360-gap-span"
                    style={{
                      left: `${Math.min(selfPct, othersPct)}%`,
                      width: `${Math.abs(selfPct - othersPct)}%`,
                    }}
                  />
                  <span className="m360-gap-dot m360-gap-dot--others" style={{ left: `${othersPct}%` }} title={`Others: ${g.othersAvg.toFixed(2)}`} />
                  <span className="m360-gap-dot m360-gap-dot--self" style={{ left: `${selfPct}%` }} title={`Self: ${g.selfScore.toFixed(2)}`} />
                </div>
                <div className="m360-gap-row__values">
                  <span>Self {g.selfScore.toFixed(1)}</span>
                  <span>Others {g.othersAvg.toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {report.questionRows.length > 0 && (
        <div className="m360-report-card">
          <h3 className="program-detail__card-title">Question breakdown</h3>
          <table className="m360-criteria-table">
            <thead>
              <tr><th>Question</th><th>Rater group</th><th>Avg score</th><th>Responses</th></tr>
            </thead>
            <tbody>
              {report.questionRows.map((q, i) => (
                <tr key={i}>
                  <td>{q.questionText ?? `Question ${q.questionId}`}</td>
                  <td>{categoryLabel(q.category)}</td>
                  <td>{q.avgScore != null ? q.avgScore.toFixed(2) : '—'}</td>
                  <td>{q.responseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
