import { useState, useEffect } from 'react'
import { Button } from '../design-system'
import { api } from '@/services/api'
import type { EmailTemplate, EmailTemplateAssignment } from '@/types/emailTemplate'
import type { Survey } from '@/types/survey'

interface Props {
  programId: number
}

// The 5 email steps in a survey's communication journey
const PROGRAM_EMAIL_STEPS = [
  {
    trigger: 'PROGRAM_WELCOME',
    label: 'Program Welcome',
    icon: '👋',
    color: '#5856d6',
    bg: '#f0f0ff',
    border: '#c7c6f5',
    description: 'Sent when a participant is added to the program',
    delayLabel: null,
    defaultDelay: 0,
    category: 'WELCOME',
  },
  {
    trigger: 'INITIAL_INVITE',
    label: 'Survey Invitation',
    icon: '📧',
    color: '#007aff',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'Sent immediately when the survey is dispatched',
    delayLabel: null,
    defaultDelay: 0,
    category: 'INVITATION',
  },
  {
    trigger: 'REMINDER_1',
    label: 'Reminder 1',
    icon: '🔔',
    color: '#ff9500',
    bg: '#fffbeb',
    border: '#fde68a',
    description: 'First nudge to participants who haven\'t responded',
    delayLabel: 'Days after dispatch',
    defaultDelay: 3,
    category: 'REMINDER',
  },
  {
    trigger: 'REMINDER_2',
    label: 'Reminder 2',
    icon: '⏰',
    color: '#ff6b00',
    bg: '#fff7f0',
    border: '#fed7aa',
    description: 'Final nudge before the survey closes',
    delayLabel: 'Days after dispatch',
    defaultDelay: 7,
    category: 'REMINDER',
  },
  {
    trigger: 'THANK_YOU',
    label: 'Thank You',
    icon: '🎉',
    color: '#34c759',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    description: 'Sent automatically when a participant submits their response',
    delayLabel: null,
    defaultDelay: 0,
    category: 'THANK_YOU',
  },
]

interface StepConfig {
  trigger: string
  templateId: number | ''
  delayDays: number
  isActive: boolean
  assignmentId?: number
}

function makeDefaultConfigs(): Record<string, StepConfig> {
  return Object.fromEntries(
    PROGRAM_EMAIL_STEPS.map(s => [s.trigger, {
      trigger: s.trigger,
      templateId: '',
      delayDays: s.defaultDelay,
      isActive: true,
    }])
  )
}

export default function ProgramCommunicationsTab({ programId }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null)
  const [allConfigs, setAllConfigs] = useState<Record<number, Record<string, StepConfig>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [testingSend, setTestingSend] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getSurveys().catch(() => [] as Survey[]),
      api.getEmailTemplates().catch(() => [] as EmailTemplate[]),
      api.getAssignmentsByProgram(programId).catch(() => [] as EmailTemplateAssignment[]),
    ]).then(([allSurveys, tmpl, assignments]) => {
      const programSurveys = allSurveys.filter(s => s.programId === programId)
      setTemplates(tmpl)
      setSurveys(programSurveys)
      if (programSurveys.length > 0) setSelectedSurveyId(programSurveys[0].surveyId)

      // Build per-survey step configs, pre-filled from existing assignments
      const bysurvey: Record<number, Record<string, StepConfig>> = {}
      programSurveys.forEach(s => {
        bysurvey[s.surveyId] = makeDefaultConfigs()
      })
      assignments.forEach(a => {
        if (a.surveyId && bysurvey[a.surveyId]?.[a.triggerType]) {
          bysurvey[a.surveyId][a.triggerType] = {
            trigger: a.triggerType,
            templateId: a.templateId,
            delayDays: a.sendDelayDays ?? 0,
            isActive: a.isActive,
            assignmentId: a.assignmentId,
          }
        }
      })
      setAllConfigs(bysurvey)
    }).finally(() => setLoading(false))
  }, [programId])

  // Derive the active survey's step configs
  const configs: Record<string, StepConfig> = selectedSurveyId
    ? (allConfigs[selectedSurveyId] ?? makeDefaultConfigs())
    : {}

  const updateConfig = (trigger: string, patch: Partial<StepConfig>) => {
    if (!selectedSurveyId) return
    setAllConfigs(prev => ({
      ...prev,
      [selectedSurveyId]: {
        ...prev[selectedSurveyId],
        [trigger]: { ...prev[selectedSurveyId][trigger], ...patch },
      },
    }))
  }

  const handleSaveStep = async (trigger: string) => {
    if (!selectedSurveyId) return
    const cfg = configs[trigger]
    if (!cfg.templateId) return
    setSaving(trigger)
    try {
      await api.saveTemplateAssignment(Number(cfg.templateId), {
        triggerType: trigger,
        programId,
        surveyId: selectedSurveyId,
        sendDelayDays: cfg.delayDays,
        isActive: cfg.isActive,
      })
      setSaved(trigger)
      setTimeout(() => setSaved(null), 2500)
    } catch {
      // silent — could show toast
    } finally {
      setSaving(null)
    }
  }

  const handleTestSend = async (trigger: string) => {
    const cfg = configs[trigger]
    if (!cfg.templateId) return
    setTestingSend(trigger)
    try {
      await api.sendTestEmail(Number(cfg.templateId))
    } finally {
      setTestingSend(null)
    }
  }

  const configuredCount = Object.values(configs).filter(c => !!c.templateId).length
  const selectedSurvey = surveys.find(s => s.surveyId === selectedSurveyId)

  if (loading) {
    return <p style={{ padding: 40, color: '#86868b', textAlign: 'center' }}>Loading communications…</p>
  }

  return (
    <div className="comm-tab">

      {/* Header */}
      <div className="comm-tab__header">
        <div>
          <h2 className="comm-tab__title">Email Communications</h2>
          <p className="comm-tab__subtitle">
            Select a survey below, then assign an email template to each step of its communication journey.
          </p>
        </div>
        {selectedSurveyId && (
          <div className="comm-tab__header-badge">
            <span className="comm-tab__progress-pill">
              {configuredCount} / {PROGRAM_EMAIL_STEPS.length} configured
            </span>
          </div>
        )}
      </div>

      {/* ── Step 1: Survey picker ─────────────────────────────────── */}
      {surveys.length === 0 ? (
        <div className="comm-tab__no-surveys">
          No surveys are linked to this program yet. Create and link surveys from the Surveys page.
        </div>
      ) : (
        <div className="comm-tab__survey-picker">
          <div className="comm-tab__survey-picker-icon">📋</div>
          <div className="comm-tab__survey-picker-body">
            <label className="comm-tab__survey-picker-label" htmlFor="survey-picker-select">
              Step 1 — Select a Survey
            </label>
            <p className="comm-tab__survey-picker-hint">
              Each survey has its own independent email journey. Switch surveys using this dropdown to configure them separately.
            </p>
            <select
              id="survey-picker-select"
              className="comm-tab__survey-picker-select"
              value={selectedSurveyId ?? ''}
              onChange={e => setSelectedSurveyId(Number(e.target.value))}
            >
              {surveys.map(s => (
                <option key={s.surveyId} value={s.surveyId}>
                  {s.title}
                  {s.status === 'ACTIVE' ? ' — Active' : s.status === 'CLOSED' ? ' — Closed' : ' — Draft'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Connector from picker to first step */}
      {selectedSurveyId && surveys.length > 0 && (
        <div className="comm-tab__picker-connector">
          <div className="comm-tab__picker-connector-line" />
          <div className="comm-tab__picker-connector-arrow">▼</div>
          <p className="comm-tab__picker-connector-label">
            Configuring: <strong>{selectedSurvey?.title}</strong>
          </p>
        </div>
      )}

      {/* ── Step 2: Journey timeline (scoped to selected survey) ──── */}
      {selectedSurveyId && (
        <div className="comm-tab__journey">
          {PROGRAM_EMAIL_STEPS.map((step, idx) => {
            const cfg = configs[step.trigger]
            const isConfigured = !!cfg?.templateId
            const isSaving = saving === step.trigger
            const isSaved = saved === step.trigger
            const isTesting = testingSend === step.trigger
            const availableTemplates = templates.filter(t =>
              t.status === 'ACTIVE' && (t.category === step.category || t.category === 'CUSTOM')
            )
            const selectedTemplate = templates.find(t => t.templateId === cfg?.templateId)

            return (
              <div key={step.trigger} className="comm-step">
                {/* Timeline connector */}
                {idx < PROGRAM_EMAIL_STEPS.length - 1 && (
                  <div className="comm-step__connector">
                    <div className="comm-step__connector-line" style={{ borderColor: isConfigured ? step.color : '#e5e7eb' }} />
                    <div className="comm-step__connector-arrow" style={{ color: isConfigured ? step.color : '#d1d5db' }}>▼</div>
                  </div>
                )}

                {/* Step card */}
                <div className="comm-step__card" style={{ borderColor: isConfigured ? step.border : '#e5e7eb', background: isConfigured ? step.bg : '#fafafa' }}>

                  {/* Step icon + label */}
                  <div className="comm-step__head">
                    <div className="comm-step__icon-wrap" style={{ background: step.bg, border: `2px solid ${step.border}` }}>
                      <span className="comm-step__icon">{step.icon}</span>
                      <span className="comm-step__step-num" style={{ color: step.color }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="comm-step__meta">
                      <h3 className="comm-step__label">{step.label}</h3>
                      <p className="comm-step__desc">{step.description}</p>
                    </div>
                    <div className="comm-step__status-wrap">
                      {isConfigured ? (
                        <span className="comm-step__badge comm-step__badge--ok" style={{ color: step.color, background: step.bg, borderColor: step.border }}>
                          ✓ Configured
                        </span>
                      ) : (
                        <span className="comm-step__badge comm-step__badge--empty">Not set</span>
                      )}
                      {/* Active toggle */}
                      <label className="comm-step__toggle-wrap">
                        <input
                          type="checkbox"
                          className="comm-step__toggle-input"
                          checked={cfg?.isActive ?? true}
                          onChange={e => updateConfig(step.trigger, { isActive: e.target.checked })}
                        />
                        <span className="comm-step__toggle-track" style={{ background: (cfg?.isActive ?? true) ? step.color : '#d1d5db' }}>
                          <span className="comm-step__toggle-thumb" />
                        </span>
                        <span className="comm-step__toggle-label">{(cfg?.isActive ?? true) ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Config row */}
                  <div className="comm-step__config">
                    {/* Template selector */}
                    <div className="comm-step__field">
                      <label className="comm-step__field-label">Email Template</label>
                      <select
                        className="comm-step__select"
                        style={{ borderColor: isConfigured ? step.border : '#d1d5db' }}
                        value={cfg?.templateId ?? ''}
                        onChange={e => updateConfig(step.trigger, { templateId: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Select template…</option>
                        {availableTemplates.length > 0 ? (
                          availableTemplates.map(t => (
                            <option key={t.templateId} value={t.templateId}>{t.name}</option>
                          ))
                        ) : (
                          templates.filter(t => t.status === 'ACTIVE').map(t => (
                            <option key={t.templateId} value={t.templateId}>{t.name} ({t.category})</option>
                          ))
                        )}
                      </select>
                      {selectedTemplate && (
                        <p className="comm-step__field-hint">Subject: {selectedTemplate.subject || '—'}</p>
                      )}
                    </div>

                    {/* Delay (reminders only) */}
                    {step.delayLabel && (
                      <div className="comm-step__field comm-step__field--delay">
                        <label className="comm-step__field-label">{step.delayLabel}</label>
                        <div className="comm-step__delay-wrap">
                          <input
                            type="number"
                            className="comm-step__delay-input"
                            min={1}
                            max={90}
                            value={cfg?.delayDays ?? step.defaultDelay}
                            onChange={e => updateConfig(step.trigger, { delayDays: Number(e.target.value) })}
                          />
                          <span className="comm-step__delay-unit">days</span>
                        </div>
                      </div>
                    )}

                    {/* Timing info (non-reminder steps) */}
                    {!step.delayLabel && (
                      <div className="comm-step__field comm-step__field--timing">
                        <label className="comm-step__field-label">Timing</label>
                        <span className="comm-step__timing-pill">Automatic</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="comm-step__actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveStep(step.trigger)}
                        disabled={!cfg?.templateId || isSaving}
                      >
                        {isSaving ? 'Saving…' : isSaved ? '✓ Saved' : 'Save'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestSend(step.trigger)}
                        disabled={!cfg?.templateId || isTesting}
                      >
                        {isTesting ? 'Sending…' : 'Send Test'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info footer */}
      <div className="comm-tab__footer">
        <span>💡</span>
        <span>
          For ad-hoc surveys not linked to a program, configure email notifications in the survey's <strong>Distribute</strong> tab.
        </span>
      </div>
    </div>
  )
}
