import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../design-system'
import Breadcrumb from '@/components/Breadcrumb'
import FormField from '@/components/FormField'
import ToggleSwitch from '@/components/ToggleSwitch'
import { api } from '@/services/api'
import type { Program } from '@/types/program'
import type { Survey } from '@/types/survey'
import type { EmailTemplate } from '@/types/emailTemplate'
import type { Participant } from '@/types/participant'
import type {
  M360Cycle, CyclePhase, CyclePhaseType, PhaseActivity, RaterCriteria, M360Enrollment, RaterCategory,
} from '@/types/m360'
import { CYCLE_PHASES, RATER_CATEGORY_LABELS } from '@/types/m360'

type WizardStep = 'cycleInfo' | 'schedule' | 'enrollment' | 'review'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'cycleInfo',  label: 'Cycle information' },
  { key: 'schedule',   label: 'Schedule' },
  { key: 'enrollment', label: 'Enrollment' },
  { key: 'review',     label: 'Survey review' },
]

// Default comm activities per phase (from the design mockups)
const DEFAULT_ACTIVITIES: Partial<Record<CyclePhaseType, { name: string; template: string }[]>> = {
  PRE_LAUNCH: [
    { name: 'Manager Pre-launch communication', template: '360-T1' },
    { name: 'Participant Pre-launch communication', template: '360-T2' },
    { name: 'Pre-launch communication for previous report-ineligible participants', template: '360-T21' },
  ],
  RATER_SELECTION: [
    { name: 'Initial communication', template: '360-T3' },
    { name: 'Reminder communication 1', template: '360-T4' },
    { name: 'Reminder communication 2', template: '360-T4' },
    { name: 'Reminder communication 3', template: '360-T4' },
  ],
  RATER_APPROVAL: [
    { name: 'Initial communication', template: '360-T5' },
    { name: 'Reminder communication 1', template: '360-T6' },
    { name: 'Reminder communication 2', template: '360-T6' },
    { name: 'Changes Required Notification', template: '360-T7' },
  ],
  RATER_FEEDBACK: [
    { name: 'Rater feedback invitation', template: '360-T8' },
  ],
}

const DEFAULT_CRITERIA: RaterCriteria[] = [
  { category: 'SELF', minCount: 1, maxCount: 1, autoLoad: true, isEnabled: true },
  { category: 'MANAGER', minCount: 1, maxCount: 1, autoLoad: true, isEnabled: true },
  { category: 'INDIRECT_MANAGER', minCount: null, maxCount: null, autoLoad: false, isEnabled: true },
  { category: 'PEERS', minCount: null, maxCount: null, autoLoad: false, isEnabled: true },
  { category: 'DIRECT_REPORTS', minCount: null, maxCount: null, autoLoad: false, isEnabled: true },
  { category: 'BUSINESS_PARTNERS', minCount: null, maxCount: null, autoLoad: false, isEnabled: true },
]

function emptyPhases(): CyclePhase[] {
  return CYCLE_PHASES.map(p => ({ phaseType: p.type, isEnabled: false, startAt: null, endAt: null, activities: [] }))
}

function splitDateTime(iso?: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const [d, t] = iso.split('T')
  return { date: d ?? '', time: (t ?? '').substring(0, 5) }
}

function joinDateTime(date: string, time: string): string | null {
  if (!date) return null
  return `${date}T${time || '09:00'}:00`
}

export default function CycleEditor() {
  const { programId, cycleId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(cycleId)

  const [step, setStep] = useState<WizardStep>('cycleInfo')
  const [program, setProgram] = useState<Program | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [enrollments, setEnrollments] = useState<M360Enrollment[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Cycle info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [active, setActive] = useState(false)
  const [surveyId, setSurveyId] = useState<number | ''>('')

  // Schedule + criteria + permissions
  const [phases, setPhases] = useState<CyclePhase[]>(emptyPhases())
  const [criteria, setCriteria] = useState<RaterCriteria[]>(DEFAULT_CRITERIA)
  const [overallMin, setOverallMin] = useState<number | ''>('')
  const [overallMax, setOverallMax] = useState<number | ''>(99)
  const [permHr, setPermHr] = useState(true)
  const [permSelf, setPermSelf] = useState(true)
  const [permManager, setPermManager] = useState(false)

  const savedCycleId = useMemo(() => (cycleId ? Number(cycleId) : null), [cycleId])

  useEffect(() => {
    if (programId) {
      api.getProgram(Number(programId)).then(setProgram).catch(() => {})
    }
    api.getSurveys().then(s => setSurveys(s.filter(x => x.templateType === 'M360' || x.status === 'ACTIVE'))).catch(() => {})
    api.getEmailTemplates().then(setTemplates).catch(() => {})
    api.getParticipants().then(setParticipants).catch(() => {})
  }, [programId])

  useEffect(() => {
    if (!savedCycleId) return
    api.getM360Cycle(savedCycleId).then(applyCycle).catch(() => {})
    api.getM360Enrollments(savedCycleId).then(setEnrollments).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCycleId])

  function applyCycle(c: M360Cycle) {
    setName(c.name)
    setDescription(c.description ?? '')
    setStartDate(c.startDate ?? '')
    setActive(c.status === 'ACTIVE')
    setSurveyId(c.surveyId ?? '')
    setOverallMin(c.overallMinRaters ?? '')
    setOverallMax(c.overallMaxRaters ?? 99)
    setPermHr(Boolean(c.allowHrSelection))
    setPermSelf(Boolean(c.allowSelfSelection))
    setPermManager(Boolean(c.allowManagerSelection))
    if (c.criteria?.length) {
      setCriteria(DEFAULT_CRITERIA.map(d => c.criteria.find(x => x.category === d.category) ?? d))
    }
    const merged = emptyPhases().map(empty => {
      const saved = c.phases?.find(p => p.phaseType === empty.phaseType)
      return saved ? { ...saved, isEnabled: Boolean(saved.isEnabled) } : empty
    })
    setPhases(merged)
  }

  function showToast(message: string) {
    setToast(message)
    setError(null)
    window.setTimeout(() => setToast(null), 4000)
  }

  function templateOptions() {
    return templates.filter(t => t.name.startsWith('360-'))
  }

  function templateIdByName(nameStr: string): number | null {
    const t = templates.find(x => x.name === nameStr)
    return t ? t.templateId : null
  }

  // ── Step saves ──────────────────────────────────────────────────────────────

  async function saveCycleInfo() {
    if (!name.trim()) { setError('Cycle name is required.'); return }
    setSaving(true); setError(null)
    try {
      const payload: Partial<M360Cycle> = {
        programId: Number(programId),
        name: name.trim(),
        description: description || null,
        startDate: startDate || null,
        status: active ? 'ACTIVE' : 'INACTIVE',
        surveyId: surveyId === '' ? null : Number(surveyId),
        allowHrSelection: permHr, allowSelfSelection: permSelf, allowManagerSelection: permManager,
        overallMinRaters: overallMin === '' ? null : Number(overallMin),
        overallMaxRaters: overallMax === '' ? null : Number(overallMax),
      }
      if (savedCycleId) {
        await api.updateM360Cycle(savedCycleId, payload)
        showToast('Cycle information has been updated.')
      } else {
        const created = await api.createM360Cycle(payload)
        showToast('Cycle information has been updated.')
        navigate(`/programs/${programId}/cycles/${created.cycleId}`, { replace: true })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save cycle.')
    } finally {
      setSaving(false)
    }
  }

  async function saveSchedule() {
    if (!savedCycleId) { setError('Save Cycle information first.'); return }
    const invalid = phases.some(p => p.isEnabled && (!p.startAt || !p.endAt))
    if (invalid) {
      setError('Errors have been found within the schedule configuration. Please attend to these errors and save again.')
      return
    }
    setSaving(true); setError(null)
    try {
      const updated = await api.saveM360Phases(savedCycleId, phases.filter(p => p.isEnabled || p.phaseId))
      applyCycle(updated)
      showToast('Schedule information has been updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save schedule.')
    } finally {
      setSaving(false)
    }
  }

  async function saveEnrollment() {
    if (!savedCycleId) { setError('Save Cycle information first.'); return }
    setSaving(true); setError(null)
    try {
      await api.saveM360Criteria(savedCycleId, criteria)
      await api.updateM360Cycle(savedCycleId, {
        allowHrSelection: permHr, allowSelfSelection: permSelf, allowManagerSelection: permManager,
        overallMinRaters: overallMin === '' ? null : Number(overallMin),
        overallMaxRaters: overallMax === '' ? null : Number(overallMax),
      })
      if (selectedParticipants.length > 0) {
        const updated = await api.enrollM360Participants(savedCycleId, selectedParticipants)
        setEnrollments(updated)
        setSelectedParticipants([])
      }
      showToast('Enrollment information has been updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save enrollment.')
    } finally {
      setSaving(false)
    }
  }

  // ── Phase helpers ───────────────────────────────────────────────────────────

  function updatePhase(type: CyclePhaseType, patch: Partial<CyclePhase>) {
    setPhases(prev => prev.map(p => (p.phaseType === type ? { ...p, ...patch } : p)))
  }

  function togglePhase(type: CyclePhaseType, on: boolean) {
    setPhases(prev => prev.map(p => {
      if (p.phaseType !== type) return p
      let activities = p.activities
      if (on && activities.length === 0) {
        activities = (DEFAULT_ACTIVITIES[type] ?? []).map((a, i) => ({
          activityName: a.name,
          emailTemplateId: templateIdByName(a.template),
          emailTemplateName: a.template,
          activityDate: null, activityTime: '09:00 AM', isEnabled: true, sortOrder: i,
        }))
      }
      return { ...p, isEnabled: on, activities }
    }))
  }

  function updateActivity(type: CyclePhaseType, index: number, patch: Partial<PhaseActivity>) {
    setPhases(prev => prev.map(p => {
      if (p.phaseType !== type) return p
      const activities = p.activities.map((a, i) => (i === index ? { ...a, ...patch } : a))
      return { ...p, activities }
    }))
  }

  function addActivity(type: CyclePhaseType) {
    setPhases(prev => prev.map(p => p.phaseType === type
      ? { ...p, activities: [...p.activities, { activityName: '', emailTemplateId: null, activityDate: null, activityTime: '09:00 AM', isEnabled: true, sortOrder: p.activities.length }] }
      : p))
  }

  function removeActivity(type: CyclePhaseType, index: number) {
    setPhases(prev => prev.map(p => p.phaseType === type
      ? { ...p, activities: p.activities.filter((_, i) => i !== index) }
      : p))
  }

  function updateCriteria(category: RaterCategory, patch: Partial<RaterCriteria>) {
    setCriteria(prev => prev.map(c => (c.category === category ? { ...c, ...patch } : c)))
  }

  const availableParticipants = participants.filter(
    p => !enrollments.some(e => e.participantId === p.participantId),
  )

  const programName = program?.name ?? 'Program'

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Programs', path: '/programs' },
        { label: programName, path: `/programs/${programId}` },
        { label: isEdit ? name || 'Edit Cycle' : 'Add Cycle' },
      ]} />

      {toast && (
        <div className="m360-toast">
          <span className="m360-toast__icon">✓</span>
          <div>
            <strong>Success!</strong>
            <p>{toast}</p>
          </div>
          <button className="m360-toast__close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <h1 className="program-detail__title" style={{ marginBottom: 24 }}>{isEdit ? 'Edit Cycle' : 'Add Cycle'}</h1>

      <div className="m360-wizard">
        {/* Left sidebar */}
        <aside className="m360-wizard__sidebar">
          <h3 className="m360-wizard__sidebar-title">Configurations</h3>
          <nav className="m360-wizard__nav">
            {STEPS.map(s => (
              <button
                key={s.key}
                className={`m360-wizard__nav-item${step === s.key ? ' m360-wizard__nav-item--active' : ''}`}
                onClick={() => setStep(s.key)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Step content */}
        <section className="m360-wizard__content">
          {error && (
            <div className="m360-error-banner">
              <span className="m360-error-banner__icon">⚠</span>
              <div>
                <strong>Configuration errors</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {step === 'cycleInfo' && (
            <>
              <h2 className="m360-wizard__step-title">Cycle information</h2>
              <p className="m360-wizard__step-desc">Set the basics for this 360 cycle: name it, describe it, choose the survey template, and pick when it starts.</p>
              <div className="program-create__row">
                <div className="program-create__field">
                  <FormField label="Cycle name" required helper="Create a name for the cycle.">
                    <input className="program-create__input" value={name} onChange={e => setName(e.target.value)} placeholder="Add name" />
                  </FormField>
                </div>
                <div className="program-create__field program-create__field--wide">
                  <FormField label="Cycle description" helper="Add a description of the cycle.">
                    <input className="program-create__input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description" />
                  </FormField>
                </div>
              </div>
              <div className="program-create__row">
                <div className="program-create__field">
                  <FormField label="Start date" required>
                    <input type="date" className="program-create__input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </FormField>
                </div>
                <div className="program-create__field">
                  <FormField label="Survey template" helper="Survey used for rater feedback.">
                    <select className="program-create__select" value={surveyId} onChange={e => setSurveyId(e.target.value === '' ? '' : Number(e.target.value))}>
                      <option value="">Choose survey</option>
                      {surveys.map(s => <option key={s.surveyId} value={s.surveyId}>{s.title}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="program-create__field program-create__field--status">
                  <span className="form-field__label">Cycle status</span>
                  <ToggleSwitch label={active ? 'Active' : 'Inactive'} checked={active} onChange={setActive} />
                </div>
              </div>
              <div className="m360-wizard__footer">
                <Button variant="secondary" onClick={() => navigate(`/programs/${programId}`)}>Cancel</Button>
                <Button variant="primary" onClick={saveCycleInfo} disabled={saving}>Save</Button>
              </div>
            </>
          )}

          {step === 'schedule' && (
            <>
              <h2 className="m360-wizard__step-title">Schedule</h2>
              <p className="m360-wizard__step-desc">Toggle the phases this cycle uses. Each enabled phase needs a start and end date/time (Eastern Time) and can send scheduled communications.</p>
              {phases.map(phase => {
                const label = CYCLE_PHASES.find(p => p.type === phase.phaseType)?.label ?? phase.phaseType
                const start = splitDateTime(phase.startAt)
                const end = splitDateTime(phase.endAt)
                return (
                  <div key={phase.phaseType} className="m360-phase">
                    <ToggleSwitch label={label} checked={phase.isEnabled} onChange={on => togglePhase(phase.phaseType, on)} />
                    {phase.isEnabled && (
                      <div className="m360-phase__body">
                        <div className="m360-phase__dates">
                          <FormField label="Start date" required helper="Eastern Time">
                            <input type="date" className="program-create__input" value={start.date}
                              onChange={e => updatePhase(phase.phaseType, { startAt: joinDateTime(e.target.value, start.time) })} />
                          </FormField>
                          <FormField label="Start time" required>
                            <input type="time" className="program-create__input" value={start.time}
                              onChange={e => updatePhase(phase.phaseType, { startAt: joinDateTime(start.date, e.target.value) })} />
                          </FormField>
                          <FormField label="End date" required helper="Eastern Time">
                            <input type="date" className="program-create__input" value={end.date}
                              onChange={e => updatePhase(phase.phaseType, { endAt: joinDateTime(e.target.value, end.time) })} />
                          </FormField>
                          <FormField label="End time" required>
                            <input type="time" className="program-create__input" value={end.time}
                              onChange={e => updatePhase(phase.phaseType, { endAt: joinDateTime(end.date, e.target.value) })} />
                          </FormField>
                        </div>

                        {phase.activities.length > 0 && (
                          <table className="m360-activities-table">
                            <thead>
                              <tr>
                                <th>Activity</th>
                                <th>Comms template</th>
                                <th>Activity date</th>
                                <th>Activity time</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {phase.activities.map((a, i) => (
                                <tr key={i}>
                                  <td>
                                    <input className="program-create__input m360-activities-table__name" value={a.activityName}
                                      placeholder="Activity name"
                                      onChange={e => updateActivity(phase.phaseType, i, { activityName: e.target.value })} />
                                  </td>
                                  <td>
                                    <select className="program-create__select" value={a.emailTemplateId ?? ''}
                                      onChange={e => updateActivity(phase.phaseType, i, { emailTemplateId: e.target.value === '' ? null : Number(e.target.value) })}>
                                      <option value="">Select</option>
                                      {templateOptions().map(t => <option key={t.templateId} value={t.templateId}>{t.name}</option>)}
                                    </select>
                                  </td>
                                  <td>
                                    <input type="date" className="program-create__input" value={a.activityDate ?? ''}
                                      onChange={e => updateActivity(phase.phaseType, i, { activityDate: e.target.value || null })} />
                                  </td>
                                  <td>
                                    <input className="program-create__input" value={a.activityTime ?? ''} placeholder="09:00 AM"
                                      onChange={e => updateActivity(phase.phaseType, i, { activityTime: e.target.value })} />
                                  </td>
                                  <td>
                                    <button className="m360-icon-btn" title="Remove activity" onClick={() => removeActivity(phase.phaseType, i)}>✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <button className="m360-add-link" onClick={() => addActivity(phase.phaseType)}>+ Add activity</button>
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="m360-wizard__footer">
                <Button variant="secondary" onClick={() => setStep('cycleInfo')}>Cancel</Button>
                <Button variant="primary" onClick={saveSchedule} disabled={saving}>Save</Button>
              </div>
            </>
          )}

          {step === 'enrollment' && (
            <>
              <h2 className="m360-wizard__step-title">Enrollment</h2>
              <p className="m360-wizard__step-desc">Define who can be selected as a rater and how many of each, who is allowed to build the rater list, and enroll the participants for this cycle.</p>

              <h3 className="m360-section-title">Rater selection criteria</h3>
              <table className="m360-criteria-table">
                <thead>
                  <tr>
                    <th>Relationship</th>
                    <th>Min raters</th>
                    <th>Max raters</th>
                    <th>Auto-Load raters</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map(c => {
                    const fixed = c.category === 'SELF' || c.category === 'MANAGER'
                    return (
                      <tr key={c.category}>
                        <td>{RATER_CATEGORY_LABELS[c.category]}</td>
                        <td>
                          {fixed ? <input className="program-create__input m360-criteria-table__num" value="1" disabled /> : (
                            <input type="number" min={0} className="program-create__input m360-criteria-table__num" placeholder="No min"
                              value={c.minCount ?? ''} onChange={e => updateCriteria(c.category, { minCount: e.target.value === '' ? null : Number(e.target.value) })} />
                          )}
                        </td>
                        <td>
                          {fixed ? <input className="program-create__input m360-criteria-table__num" value="1" disabled /> : (
                            <input type="number" min={0} className="program-create__input m360-criteria-table__num" placeholder="No max"
                              value={c.maxCount ?? ''} onChange={e => updateCriteria(c.category, { maxCount: e.target.value === '' ? null : Number(e.target.value) })} />
                          )}
                        </td>
                        <td>
                          {fixed && (
                            <label className="m360-check">
                              <input type="checkbox" checked={Boolean(c.autoLoad)} onChange={e => updateCriteria(c.category, { autoLoad: e.target.checked })} />
                              {c.category === 'SELF' ? 'Auto-load participant to rate themselves' : 'Auto-load manager to rate participant'}
                            </label>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td><strong>Overall rater limits</strong></td>
                    <td>
                      <input type="number" min={0} className="program-create__input m360-criteria-table__num" placeholder="No min"
                        value={overallMin} onChange={e => setOverallMin(e.target.value === '' ? '' : Number(e.target.value))} />
                    </td>
                    <td>
                      <input type="number" min={0} className="program-create__input m360-criteria-table__num"
                        value={overallMax} onChange={e => setOverallMax(e.target.value === '' ? '' : Number(e.target.value))} />
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <h3 className="m360-section-title">Permission to select raters</h3>
              <div className="m360-perms">
                <ToggleSwitch label="HR Partners" checked={permHr} onChange={setPermHr} />
                <ToggleSwitch label="Participant (Self)" checked={permSelf} onChange={setPermSelf} />
                <ToggleSwitch label="Manager" checked={permManager} onChange={setPermManager} />
              </div>

              <h3 className="m360-section-title">Participants</h3>
              {enrollments.length === 0 ? (
                <p className="m360-empty">No participants have been enrolled.</p>
              ) : (
                <table className="m360-criteria-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Status</th><th>Raters</th><th>Links</th><th></th></tr>
                  </thead>
                  <tbody>
                    {enrollments.map(e => (
                      <tr key={e.enrollmentId}>
                        <td>{e.participantName ?? e.participantId}</td>
                        <td>{e.participantEmail ?? '—'}</td>
                        <td>{e.status.replace(/_/g, ' ')}</td>
                        <td>{e.raterCount}</td>
                        <td>
                          <a className="m360-add-link" href={`/m360/rater-selection/${e.participantToken}`} target="_blank" rel="noreferrer">Selection</a>
                          {' · '}
                          <a className="m360-add-link" href={`/m360/approval/${e.managerToken}`} target="_blank" rel="noreferrer">Approval</a>
                        </td>
                        <td>
                          <button className="m360-icon-btn" title="Remove"
                            onClick={() => savedCycleId && api.removeM360Enrollment(savedCycleId, e.enrollmentId).then(() => api.getM360Enrollments(savedCycleId).then(setEnrollments))}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {availableParticipants.length > 0 && (
                <div className="m360-enroll-picker">
                  <h4 className="m360-section-subtitle">Add participants from the roster</h4>
                  <div className="m360-enroll-picker__list">
                    {availableParticipants.map(p => (
                      <label key={p.participantId} className="m360-check">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(p.participantId)}
                          onChange={e => setSelectedParticipants(prev =>
                            e.target.checked ? [...prev, p.participantId] : prev.filter(id => id !== p.participantId))}
                        />
                        {p.fullName} <span className="m360-muted">({p.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="m360-wizard__footer">
                <Button variant="secondary" onClick={() => setStep('schedule')}>Cancel</Button>
                <Button variant="primary" onClick={saveEnrollment} disabled={saving}>Save</Button>
              </div>
            </>
          )}

          {step === 'review' && (
            <>
              <h2 className="m360-wizard__step-title">Survey review</h2>
              <p className="m360-wizard__step-desc">Read-only summary of this cycle's configuration.</p>
              <div className="program-detail__info-grid">
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Cycle name</span>
                  <span className="program-detail__info-value">{name || '—'}</span>
                </div>
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Status</span>
                  <span className="program-detail__info-value">{active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Start date</span>
                  <span className="program-detail__info-value">{startDate || '—'}</span>
                </div>
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Survey template</span>
                  <span className="program-detail__info-value">{surveys.find(s => s.surveyId === surveyId)?.title ?? '—'}</span>
                </div>
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Enabled phases</span>
                  <span className="program-detail__info-value">
                    {phases.filter(p => p.isEnabled).map(p => CYCLE_PHASES.find(x => x.type === p.phaseType)?.label.replace(' phase', '')).join(', ') || '—'}
                  </span>
                </div>
                <div className="program-detail__info-item">
                  <span className="program-detail__info-label">Participants enrolled</span>
                  <span className="program-detail__info-value">{enrollments.length}</span>
                </div>
                <div className="program-detail__info-item program-detail__info-item--full">
                  <span className="program-detail__info-label">Rater criteria</span>
                  <span className="program-detail__info-value">
                    {criteria.filter(c => c.minCount != null || c.maxCount != null).map(c =>
                      `${RATER_CATEGORY_LABELS[c.category]}: ${c.minCount ?? 0}–${c.maxCount ?? '∞'}`).join('  ·  ')}
                    {overallMin !== '' || overallMax !== '' ? `  ·  Overall: ${overallMin || 0}–${overallMax || '∞'}` : ''}
                  </span>
                </div>
              </div>
              {typeof surveyId === 'number' && (
                <div style={{ marginTop: 16 }}>
                  <Button variant="secondary" size="sm" onClick={() => window.open(`/surveys/${surveyId}/edit`, '_blank')}>
                    Open survey template
                  </Button>
                </div>
              )}
              <div className="m360-wizard__footer">
                <Button variant="secondary" onClick={() => setStep('enrollment')}>Back</Button>
                <Button variant="primary" onClick={() => navigate(`/programs/${programId}`)}>Done</Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
