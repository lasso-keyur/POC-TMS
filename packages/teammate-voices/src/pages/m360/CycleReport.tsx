import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '@/components/Breadcrumb'
import { api } from '@/services/api'
import type { M360Report } from '@/types/m360'
import { RATER_CATEGORY_LABELS } from '@/types/m360'

const CATEGORY_COLORS: Record<string, string> = {
  SELF: '#012169',
  MANAGER: '#4a6fb5',
  PEERS: '#7f9ed1',
  DIRECT_REPORTS: '#c0392b',
  BUSINESS_PARTNERS: '#e67e22',
  INDIRECT_MANAGER: '#6b7280',
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
                  {RATER_CATEGORY_LABELS[c.category] ?? c.category}
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
      </div>

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
                  <td>{RATER_CATEGORY_LABELS[q.category] ?? q.category}</td>
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
