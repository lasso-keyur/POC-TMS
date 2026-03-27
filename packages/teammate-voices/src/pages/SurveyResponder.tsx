import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button, ProgressBar } from '../design-system'
import type { Survey, SurveyPage, SurveyQuestion, SurveyOption } from '@/types/survey'
import type { LogicRule, LogicCondition, LogicEvaluationResult } from '@/types/logic'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

/* ================================================================
   Types & Config
   ================================================================ */

interface RendererProps {
  question: SurveyQuestion
  value: string
  onChange: (value: string) => void
}

interface QConfig {
  visibilityEnabled: boolean
  visibilityCondition: {
    sourceQuestionIdx: number
    operator: string
    value: string
  } | null
  validationMin?: string
  validationMax?: string
  validationPattern?: string
  skipToQuestionIdx?: number
  defaultValue?: string
}

/* ================================================================
   Helpers (same logic as FormViewer)
   ================================================================ */

function parseQConfig(q: SurveyQuestion): QConfig {
  if (q.secondaryType) {
    try { return JSON.parse(q.secondaryType) } catch { /* ignore */ }
  }
  return { visibilityEnabled: false, visibilityCondition: null }
}

function qKey(page: SurveyPage, qIdx: number): string {
  const q = page.questions[qIdx]
  return q.questionId?.toString() ?? `${page.pageId}-q${qIdx}`
}

function buildDefaults(pages: SurveyPage[]): Record<string, string> {
  const defs: Record<string, string> = {}
  pages.forEach(page =>
    page.questions.forEach((q, i) => {
      const d = parseQConfig(q).defaultValue
      if (d) defs[qKey(page, i)] = d
    }),
  )
  return defs
}

function isVisibleByConfig(
  q: SurveyQuestion, _qIdx: number, page: SurveyPage, answers: Record<string, string>,
): boolean {
  const cfg = parseQConfig(q)
  if (!cfg.visibilityEnabled || !cfg.visibilityCondition) return true
  const { sourceQuestionIdx, operator, value } = cfg.visibilityCondition
  if (sourceQuestionIdx < 0 || sourceQuestionIdx >= page.questions.length) return true
  const src = answers[qKey(page, sourceQuestionIdx)] ?? ''
  switch (operator) {
    case 'equals':       return src === value
    case 'not_equals':   return src !== value
    case 'contains':     return src.includes(value)
    case 'is_empty':     return !src
    case 'is_not_empty': return !!src
    case 'greater_than': return Number(src) > Number(value)
    case 'less_than':    return Number(src) < Number(value)
    default:             return true
  }
}

function getSkippedIndices(page: SurveyPage, answers: Record<string, string>): Set<number> {
  const skipped = new Set<number>()
  for (let i = 0; i < page.questions.length; i++) {
    const cfg = parseQConfig(page.questions[i])
    if (cfg.skipToQuestionIdx != null && answers[qKey(page, i)]) {
      for (let j = i + 1; j < cfg.skipToQuestionIdx && j < page.questions.length; j++) {
        skipped.add(j)
      }
    }
  }
  return skipped
}

function validateAnswer(q: SurveyQuestion, answer: string, logicRequired: boolean): string | null {
  const cfg = parseQConfig(q)
  if ((q.isRequired || logicRequired) && !answer) return 'This question is required.'
  if (!answer) return null
  if (cfg.validationMin && Number(answer) < Number(cfg.validationMin))
    return `Value must be at least ${cfg.validationMin}.`
  if (cfg.validationMax && Number(answer) > Number(cfg.validationMax))
    return `Value must be at most ${cfg.validationMax}.`
  if (cfg.validationPattern) {
    try {
      if (!new RegExp(cfg.validationPattern).test(answer))
        return 'Answer does not match the required format.'
    } catch { /* bad regex */ }
  }
  return null
}

function evalCond(
  c: LogicCondition,
  answers: Record<string, string>,
  participantCtx?: Record<string, string>,
): boolean {
  // Resolve the value to compare against
  let ans: string
  if (c.conditionType === 'participant') {
    // Participant attribute condition — use context if available, else skip (return true = show)
    if (!participantCtx) return true
    ans = participantCtx[c.participantField ?? ''] ?? ''
  } else {
    ans = answers[c.questionId ?? ''] ?? ''
  }

  const val = String(c.value ?? '')
  switch (c.operator) {
    case 'equals':       return ans === val
    case 'not_equals':   return ans !== val
    case 'greater_than': return Number(ans) > Number(val)
    case 'less_than':    return Number(ans) < Number(val)
    case 'contains':     return ans.toLowerCase().includes(val.toLowerCase())
    case 'not_contains': return !ans.toLowerCase().includes(val.toLowerCase())
    case 'is_empty':     return !ans
    case 'is_not_empty': return !!ans
    case 'any_of': {
      const vals = Array.isArray(c.value) ? c.value.map(String) : [val]
      return vals.some(v => ans === v || ans.includes(v))
    }
    case 'between': {
      const [lo, hi] = val.split(',').map(Number)
      const n = Number(ans)
      return n >= lo && n <= hi
    }
    default: return false
  }
}

function evalRules(
  rules: LogicRule[],
  answers: Record<string, string>,
  participantCtx?: Record<string, string>,
): LogicEvaluationResult {
  const visibilityMap: Record<string, boolean> = {}
  const requiredMap: Record<string, boolean> = {}
  let skipTarget: string | undefined
  const pipedValues: Record<string, string> = {}

  for (const rule of rules) {
    const items = rule.conditions.items
    if (!items.length) continue
    const results = items.map(c => evalCond(c, answers, participantCtx))
    const met = rule.conditions.operator === 'AND'
      ? results.every(Boolean) : results.some(Boolean)

    switch (rule.type) {
      case 'visible_if':
        if (rule.action.targetQuestionId)
          visibilityMap[rule.action.targetQuestionId] =
            rule.action.type === 'show' ? met : !met
        break
      case 'required_if':
        if (rule.action.targetQuestionId)
          requiredMap[rule.action.targetQuestionId] = met
        break
      case 'skip_to':
        if (met && !skipTarget)
          skipTarget = rule.action.targetQuestionId ?? rule.action.targetPageId
        break
      case 'pipe_text':
        if (met && rule.action.pipeField && items[0]?.questionId)
          pipedValues[rule.action.pipeField] = answers[items[0].questionId] ?? ''
        break
    }
  }

  return { visibilityMap, requiredMap, skipTarget, pipedValues }
}

/* ================================================================
   Question Renderers (same as FormViewer)
   ================================================================ */

function RatingScaleQuestion({ question, value, onChange }: RendererProps) {
  const options = question.options?.length
    ? question.options
    : [
        { optionText: 'Strongly Disagree', optionValue: 1, sortOrder: 1 },
        { optionText: 'Disagree', optionValue: 2, sortOrder: 2 },
        { optionText: 'Neutral', optionValue: 3, sortOrder: 3 },
        { optionText: 'Agree', optionValue: 4, sortOrder: 4 },
        { optionText: 'Strongly Agree', optionValue: 5, sortOrder: 5 },
      ]
  return (
    <div className="fv-rating">
      <div className="fv-rating__options">
        {options.map((opt: SurveyOption) => (
          <button key={opt.optionValue} type="button"
            className={`fv-rating__option${value === opt.optionText ? ' fv-rating__option--selected' : ''}`}
            onClick={() => onChange(opt.optionText)}>
            <span className="fv-rating__value">{opt.optionValue}</span>
            <span className="fv-rating__label">{opt.optionText}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function RadioQuestion({ question, value, onChange }: RendererProps) {
  const options = question.options?.length ? question.options
    : [{ optionText: 'Option 1', optionValue: 1, sortOrder: 1 }, { optionText: 'Option 2', optionValue: 2, sortOrder: 2 }, { optionText: 'Option 3', optionValue: 3, sortOrder: 3 }]
  return (
    <div className="fv-radio-group">
      {options.map((opt: SurveyOption) => (
        <label key={opt.optionValue} className="fv-radio">
          <input type="radio" name={`q-${question.questionId ?? question.sortOrder}`} className="fv-radio__input" checked={value === opt.optionText} onChange={() => onChange(opt.optionText)} />
          <span className="fv-radio__mark" /><span className="fv-radio__text">{opt.optionText}</span>
        </label>
      ))}
    </div>
  )
}

function CheckboxQuestion({ question, value, onChange }: RendererProps) {
  const selected = new Set(value ? value.split('||') : [])
  const options = question.options?.length ? question.options
    : [{ optionText: 'Option 1', optionValue: 1, sortOrder: 1 }, { optionText: 'Option 2', optionValue: 2, sortOrder: 2 }, { optionText: 'Option 3', optionValue: 3, sortOrder: 3 }]
  const toggle = (text: string) => { const next = new Set(selected); if (next.has(text)) next.delete(text); else next.add(text); onChange(Array.from(next).filter(Boolean).join('||')) }
  return (
    <div className="fv-checkbox-group">
      {options.map((opt: SurveyOption) => (
        <label key={opt.optionValue} className="fv-checkbox">
          <input type="checkbox" className="fv-checkbox__input" checked={selected.has(opt.optionText)} onChange={() => toggle(opt.optionText)} />
          <span className="fv-checkbox__mark" /><span className="fv-checkbox__text">{opt.optionText}</span>
        </label>
      ))}
    </div>
  )
}

function SelectQuestion({ question, value, onChange }: RendererProps) {
  const options = question.options?.length ? question.options
    : [{ optionText: 'Option 1', optionValue: 1, sortOrder: 1 }, { optionText: 'Option 2', optionValue: 2, sortOrder: 2 }, { optionText: 'Option 3', optionValue: 3, sortOrder: 3 }]
  return (
    <select className="fv-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select an option</option>
      {options.map((opt: SurveyOption) => (<option key={opt.optionValue} value={opt.optionText}>{opt.optionText}</option>))}
    </select>
  )
}

function SlidingScaleQuestion({ value, onChange }: RendererProps) {
  const numVal = value ? Number(value) : 50
  return (
    <div className="fv-slider">
      <input type="range" min={0} max={100} value={numVal} onChange={e => onChange(e.target.value)} className="fv-slider__input" />
      <div className="fv-slider__labels"><span>0</span><span className="fv-slider__value">{numVal}</span><span>100</span></div>
    </div>
  )
}

function TextInputQuestion({ value, onChange }: RendererProps) {
  return <input type="text" className="fv-text-input" placeholder="Type your answer here..." value={value} onChange={e => onChange(e.target.value)} />
}

function TextAreaQuestion({ value, onChange }: RendererProps) {
  return <textarea className="fv-textarea" placeholder="Type your response here..." rows={4} value={value} onChange={e => onChange(e.target.value)} />
}

function StaticTextQuestion({ question }: RendererProps) {
  return <div className="fv-static-text">{question.questionDescription || 'This is static informational text displayed to the respondent.'}</div>
}

function GridRatingQuestion({ question, value, onChange }: RendererProps) {
  const cols = question.options?.length ? question.options : Array.from({ length: 5 }, (_, i) => ({ optionText: String(i + 1), optionValue: i + 1, sortOrder: i + 1 }))
  return (
    <div className="fv-grid-rating">
      <div className="fv-grid-rating__row">
        {cols.map((opt: SurveyOption) => (
          <button key={opt.optionValue} type="button" className={`fv-grid-rating__cell${value === opt.optionText ? ' fv-grid-rating__cell--selected' : ''}`} onClick={() => onChange(opt.optionText)}>{opt.optionText}</button>
        ))}
      </div>
    </div>
  )
}

function QuestionRenderer(props: RendererProps) {
  const type = props.question.questionType?.toLowerCase().replace(/[\s_-]/g, '')
  switch (type) {
    case 'ratingscale': case 'rating_scale': return <RatingScaleQuestion {...props} />
    case 'radiobuttons':    return <RadioQuestion {...props} />
    case 'checkboxes':      return <CheckboxQuestion {...props} />
    case 'singleselect':    return <SelectQuestion {...props} />
    case 'multiselect':     return <CheckboxQuestion {...props} />
    case 'slidingscale':    return <SlidingScaleQuestion {...props} />
    case 'singlelineinput': case 'text': return <TextInputQuestion {...props} />
    case 'textarea':        return <TextAreaQuestion {...props} />
    case 'statictext':      return <StaticTextQuestion {...props} />
    case 'gridratingscale': return <GridRatingQuestion {...props} />
    default:                return <TextInputQuestion {...props} />
  }
}

/* ================================================================
   PageView
   ================================================================ */

interface PageViewProps {
  page: SurveyPage
  pageIndex: number
  totalPages: number
  answers: Record<string, string>
  onAnswer: (key: string, value: string) => void
  logicResult: LogicEvaluationResult
  errors: Record<string, string>
}

function PageView({ page, pageIndex, totalPages, answers, onAnswer, logicResult, errors }: PageViewProps) {
  const skipped = getSkippedIndices(page, answers)
  let visibleNum = 0

  return (
    <div className="fv-page">
      <div className="fv-page__header">
        <span className="fv-page__number">Page {pageIndex + 1} of {totalPages}</span>
        <h2 className="fv-page__title">{page.title || `Page ${pageIndex + 1}`}</h2>
        {page.showDescription && page.description && (
          <p className="fv-page__description">{page.description}</p>
        )}
      </div>
      <div className="fv-page__questions">
        {page.questions.map((q, qIdx) => {
          const key = qKey(page, qIdx)
          const configVis = isVisibleByConfig(q, qIdx, page, answers)
          const logicVis = key in logicResult.visibilityMap ? logicResult.visibilityMap[key] : true
          if (!configVis || !logicVis || skipped.has(qIdx)) return null
          visibleNum++
          const logicRequired = logicResult.requiredMap[key] ?? false
          const isReq = q.isRequired || logicRequired
          const error = errors[key]
          return (
            <div key={key} className={`fv-question${error ? ' fv-question--error' : ''}`}>
              <div className="fv-question__header">
                <span className="fv-question__number">{visibleNum}</span>
                <div className="fv-question__text-wrap">
                  <h3 className="fv-question__text">
                    {q.questionText || 'Untitled question'}
                    {isReq && <span className="fv-question__required">*</span>}
                  </h3>
                  {q.showDescription && q.questionDescription && (
                    <p className="fv-question__description">{q.questionDescription}</p>
                  )}
                </div>
              </div>
              <div className="fv-question__body">
                <QuestionRenderer question={q} value={answers[key] ?? ''} onChange={v => onAnswer(key, v)} />
                {error && <p className="fv-question__error">{error}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================
   Main SurveyResponder
   ================================================================ */

export default function SurveyResponder() {
  const { token, surveyId } = useParams<{ token?: string; surveyId?: string }>()
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get('token')
  const effectiveToken = token || tokenFromQuery

  const isPublicMode = !!surveyId && !effectiveToken

  const [survey, setSurvey] = useState<Partial<Survey> | null>(null)
  const [logicRules, setLogicRules] = useState<LogicRule[]>([])
  const [participantContext, setParticipantContext] = useState<Record<string, string> | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load survey data
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        let url: string
        if (isPublicMode) {
          url = `${API_BASE}/surveys/${surveyId}/public`
        } else if (effectiveToken) {
          url = `${API_BASE}/respond/${effectiveToken}`
        } else {
          setError('Invalid survey link. No token or survey ID provided.')
          setLoading(false)
          return
        }

        const res = await fetch(url)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as Record<string, string>).message || `Survey not available (${res.status})`)
        }

        const data = await res.json()

        // Parse pages if they're a JSON string
        let surveyData = data
        if (typeof data.pages === 'string') {
          try { surveyData = { ...data, pages: JSON.parse(data.pages) } } catch { surveyData = { ...data, pages: [] } }
        }

        setSurvey(surveyData)

        // Participant context for audience-based logic rules (token mode only)
        if (data.participantContext) {
          setParticipantContext(data.participantContext)
        }

        // Load logic rules if survey has logicJson
        if (data.logicJson) {
          try {
            const rules = typeof data.logicJson === 'string' ? JSON.parse(data.logicJson) : data.logicJson
            setLogicRules(rules)
          } catch { /* ignore */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load survey')
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [effectiveToken, surveyId, isPublicMode])

  // Pages
  const viewPages: SurveyPage[] = useMemo(() => {
    if (!survey) return []
    const pages = survey.pages?.length ? survey.pages : []
    if (pages.length > 0) return pages
    if (survey.questions?.length) {
      return [{
        pageId: 'respond-page',
        title: survey.title || 'Survey',
        label: 'Page 1',
        description: survey.description || '',
        showDescription: !!survey.description,
        sortOrder: 1,
        questions: survey.questions,
      }]
    }
    return []
  }, [survey])

  // State
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize defaults once pages load
  useEffect(() => {
    if (viewPages.length > 0) {
      setAnswers(buildDefaults(viewPages))
    }
  }, [viewPages])

  const handleAnswer = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setErrors(prev => { if (!prev[key]) return prev; const next = { ...prev }; delete next[key]; return next })
  }, [])

  const logicResult = useMemo(
    () => evalRules(logicRules, answers, participantContext),
    [logicRules, answers, participantContext],
  )

  const findPageForId = useCallback((targetId: string): number => {
    for (let pi = 0; pi < viewPages.length; pi++) {
      if (viewPages[pi].pageId === targetId) return pi
      for (let qi = 0; qi < viewPages[pi].questions.length; qi++) {
        if (qKey(viewPages[pi], qi) === targetId) return pi
      }
    }
    return currentPage + 1
  }, [viewPages, currentPage])

  const validateCurrentPage = useCallback((): boolean => {
    if (!viewPages[currentPage]) return true
    const page = viewPages[currentPage]
    const skipped = getSkippedIndices(page, answers)
    const newErrors: Record<string, string> = {}
    page.questions.forEach((q, qIdx) => {
      const key = qKey(page, qIdx)
      const configVis = isVisibleByConfig(q, qIdx, page, answers)
      const logicVis = key in logicResult.visibilityMap ? logicResult.visibilityMap[key] : true
      if (!configVis || !logicVis || skipped.has(qIdx)) return
      const logicReq = logicResult.requiredMap[key] ?? false
      const err = validateAnswer(q, answers[key] ?? '', logicReq)
      if (err) newErrors[key] = err
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [viewPages, currentPage, answers, logicResult])

  const handleNext = () => {
    if (!validateCurrentPage()) return
    if (logicResult.skipTarget) {
      const targetPage = findPageForId(logicResult.skipTarget)
      if (targetPage > currentPage) { setCurrentPage(targetPage); return }
    }
    setCurrentPage(p => Math.min(p + 1, viewPages.length - 1))
  }

  const handleSubmit = async () => {
    if (!validateCurrentPage()) return
    setSubmitting(true)
    try {
      let url: string
      if (isPublicMode) {
        url = `${API_BASE}/surveys/${surveyId}/public/submit`
      } else {
        url = `${API_BASE}/respond/${effectiveToken}/submit`
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).message || 'Failed to submit survey')
      }

      setSubmitted(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Progress
  const totalQuestions = viewPages.reduce((sum, p) => sum + p.questions.length, 0)
  const answeredCount = Object.values(answers).filter(v => !!v).length
  const progress = totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0
  const isLastPage = currentPage === viewPages.length - 1
  const isFirstPage = currentPage === 0

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="fv" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#86868b', fontSize: 15 }}>Loading survey...</p>
      </div>
    )
  }

  /* ---- Error state ---- */
  if (error) {
    return (
      <div className="fv" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d70015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1d1d1f' }}>Survey Unavailable</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#86868b', maxWidth: 400, textAlign: 'center' }}>{error}</p>
      </div>
    )
  }

  /* ---- Thank you state ---- */
  if (submitted) {
    return (
      <div className="fv" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1d1d1f' }}>Thank you!</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#6e6e73', maxWidth: 400, textAlign: 'center' }}>
          Your response has been submitted successfully. You may close this window.
        </p>
      </div>
    )
  }

  /* ---- Survey form ---- */
  return (
    <div className="fv" style={{ minHeight: '100vh', paddingTop: 48, paddingBottom: 80 }}>
      {/* Survey header */}
      <div className="fv__header">
        <h1 className="fv__title">{survey?.title || 'Survey'}</h1>
        {survey?.description && <p className="fv__subtitle">{survey.description}</p>}
        <div className="fv__meta">
          {survey?.isAnonymous && (
            <span className="fv__meta-tag fv__meta-tag--anonymous">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2C4.69 2 2 4.69 2 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 2a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 8.4c-1.5 0-2.83-.77-3.6-1.93.02-1.19 2.4-1.85 3.6-1.85 1.19 0 3.58.66 3.6 1.85A4.31 4.31 0 018 12.4z" fill="currentColor"/></svg>
              Anonymous
            </span>
          )}
          <span className="fv__meta-tag">{totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</span>
          <span className="fv__meta-tag">{viewPages.length} page{viewPages.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="fv__progress">
        <ProgressBar value={progress} label="Progress" />
      </div>

      {/* Page dots */}
      {viewPages.length > 1 && (
        <div className="fv__page-nav">
          {viewPages.map((p, i) => (
            <button key={p.pageId} type="button"
              className={`fv__page-dot${i === currentPage ? ' fv__page-dot--active' : ''}${i < currentPage ? ' fv__page-dot--done' : ''}`}
              onClick={() => i < currentPage ? setCurrentPage(i) : undefined}
              title={p.title || `Page ${i + 1}`}>
              {i < currentPage ? (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (<span>{i + 1}</span>)}
            </button>
          ))}
        </div>
      )}

      {/* Current page */}
      {viewPages[currentPage] && (
        <PageView
          page={viewPages[currentPage]}
          pageIndex={currentPage}
          totalPages={viewPages.length}
          answers={answers}
          onAnswer={handleAnswer}
          logicResult={logicResult}
          errors={errors}
        />
      )}

      {/* Footer navigation */}
      <div className="fv__footer">
        <Button variant="secondary" size="md" onClick={() => { setErrors({}); setCurrentPage(p => p - 1) }} disabled={isFirstPage}>
          ← Previous
        </Button>
        <span className="fv__footer-info">Page {currentPage + 1} of {viewPages.length}</span>
        {isLastPage ? (
          <Button variant="primary" size="md" onClick={handleSubmit} loading={submitting}>
            Submit Survey
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={handleNext}>Next →</Button>
        )}
      </div>
    </div>
  )
}
