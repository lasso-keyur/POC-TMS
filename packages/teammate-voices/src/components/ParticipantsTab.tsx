import { useState, useEffect, useRef } from 'react'
import { Button, Input } from '../design-system'
import { api } from '@/services/api'
import type { Participant } from '@/types/participant'

interface ImportResult {
  totalRows: number
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadParticipants = () => {
    setLoading(true)
    api.getParticipants()
      .then(setParticipants)
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadParticipants() }, [])

  const filtered = participants.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.region || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.lineOfBusiness || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleImportClick = () => {
    setImportResult(null)
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.xlsx')) {
      setImportError('Only .xlsx files are supported. Please upload an Excel spreadsheet.')
      e.target.value = ''
      return
    }
    setImporting(true)
    setImportResult(null)
    setImportError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('tv_token')
      const res = await fetch('/api/participants/import', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) {
        const msg = await res.text()
        setImportError(msg || 'Import failed')
      } else {
        const result: ImportResult = await res.json()
        setImportResult(result)
        loadParticipants()
      }
    } catch {
      setImportError('Network error — could not reach the server')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="ptab">

      {/* Header */}
      <div className="ptab__header">
        <div>
          <h2 className="ptab__title">Participants</h2>
          <p className="ptab__subtitle">
            Manage the audience for this survey. Import via Excel or review existing participants.
            Changes here are global and affect all surveys.
          </p>
        </div>
        <div className="ptab__actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button variant="primary" size="sm" onClick={handleImportClick} disabled={importing}>
            {importing ? '⏳ Importing…' : '⬆ Import Excel (.xlsx)'}
          </Button>
        </div>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className={`ptab__banner ptab__banner--${importResult.errors.length > 0 ? 'warn' : 'success'}`}>
          <div className="ptab__banner-title">
            Import complete — {importResult.totalRows} rows processed
          </div>
          <div className="ptab__banner-stats">
            <span className="ptab__banner-stat ptab__banner-stat--created">✓ {importResult.created} created</span>
            <span className="ptab__banner-stat ptab__banner-stat--updated">↑ {importResult.updated} updated</span>
            {importResult.skipped > 0 && (
              <span className="ptab__banner-stat ptab__banner-stat--skipped">⚠ {importResult.skipped} skipped</span>
            )}
          </div>
          {importResult.errors.length > 0 && (
            <ul className="ptab__banner-errors">
              {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
          <button className="ptab__banner-dismiss" onClick={() => setImportResult(null)}>Dismiss</button>
        </div>
      )}

      {/* Import error banner */}
      {importError && (
        <div className="ptab__banner ptab__banner--error">
          <span>{importError}</span>
          <button className="ptab__banner-close" onClick={() => setImportError(null)}>✕</button>
        </div>
      )}

      {/* Excel format hint */}
      <div className="ptab__hint">
        <span className="ptab__hint-icon">📋</span>
        <span>
          Excel columns: <strong>Full Name</strong>, <strong>Email</strong>, <strong>Type</strong> (NEW_HIRE / EXISTING_RESOURCE),{' '}
          <strong>Region</strong>, <strong>Line of Business</strong>, <strong>Cohort</strong>, <strong>Start Date</strong>
        </span>
      </div>

      {/* Search + count */}
      <div className="ptab__toolbar">
        <Input
          placeholder="Search by name, email, region or LOB…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
        />
        {!loading && (
          <span className="ptab__count">
            {filtered.length} of {participants.length} participants
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="ptab__empty">Loading participants…</p>
      ) : filtered.length === 0 ? (
        <div className="ptab__empty-card">
          <p className="ptab__empty-title">
            {search ? 'No participants match your search' : 'No participants imported yet'}
          </p>
          {!search && (
            <p className="ptab__empty-sub">
              Click <strong>Import Excel (.xlsx)</strong> above to bulk-load participants from a spreadsheet.
            </p>
          )}
        </div>
      ) : (
        <div className="ptab__table-wrap">
          <table className="ptab__table">
            <thead>
              <tr>
                {['Name', 'Email', 'Type', 'Region', 'Line of Business', 'Cohort', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.participantId}>
                  <td className="ptab__cell--name">{p.fullName}</td>
                  <td className="ptab__cell--muted">{p.email}</td>
                  <td>
                    <span className="ptab__pill ptab__pill--type">
                      {p.participantType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="ptab__cell--muted">{p.region || '—'}</td>
                  <td className="ptab__cell--muted">{p.lineOfBusiness || '—'}</td>
                  <td className="ptab__cell--muted">{p.cohort || '—'}</td>
                  <td>
                    <span className={`ptab__pill ${p.isActive ? 'ptab__pill--active' : 'ptab__pill--inactive'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
