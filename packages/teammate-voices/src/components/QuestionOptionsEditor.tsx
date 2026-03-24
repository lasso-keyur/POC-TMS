import { useState } from 'react'
import type { SurveyQuestion, SurveyOption } from '@/types/survey'

interface QuestionOptionsEditorProps {
  question: SurveyQuestion
  onChange: (updated: SurveyQuestion) => void
}

/* ─── helpers ─── */
function nextSortOrder(opts: SurveyOption[]) {
  return opts.length > 0 ? Math.max(...opts.map(o => o.sortOrder)) + 1 : 1
}

function normalize(type: string) {
  return type.toLowerCase().replace(/[\s_-]/g, '')
}

/* ═══════════════════════════════════════
   Type-specific editors
   ═══════════════════════════════════════ */

/* ─── Checkbox / Radio / Select options ─── */
function ChoiceOptionsEditor({
  question,
  onChange,
  icon,
}: QuestionOptionsEditorProps & { icon: 'checkbox' | 'radio' | 'select' }) {
  const [newText, setNewText] = useState('')
  const options = question.options || []

  const addOption = () => {
    const text = newText.trim() || `Option ${options.length + 1}`
    const updated: SurveyOption[] = [
      ...options,
      { optionText: text, optionValue: nextSortOrder(options), sortOrder: nextSortOrder(options) },
    ]
    onChange({ ...question, options: updated })
    setNewText('')
  }

  const updateOptionText = (idx: number, text: string) => {
    const updated = options.map((o, i) => (i === idx ? { ...o, optionText: text } : o))
    onChange({ ...question, options: updated })
  }

  const removeOption = (idx: number) => {
    onChange({ ...question, options: options.filter((_, i) => i !== idx) })
  }

  const moveOption = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= options.length) return
    const arr = [...options]
    ;[arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]]
    arr.forEach((o, i) => (o.sortOrder = i + 1))
    onChange({ ...question, options: arr })
  }

  const iconEl = (i: number) => {
    if (icon === 'checkbox')
      return (
        <span className="qoe-choice__icon qoe-choice__icon--checkbox">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="#c7c7cc" strokeWidth="1.5" />
          </svg>
        </span>
      )
    if (icon === 'radio')
      return (
        <span className="qoe-choice__icon qoe-choice__icon--radio">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#c7c7cc" strokeWidth="1.5" />
          </svg>
        </span>
      )
    return <span className="qoe-choice__icon qoe-choice__icon--number">{i + 1}</span>
  }

  return (
    <div className="qoe-choice">
      <div className="qoe-choice__label">
        <span className="qoe-choice__label-text">Options</span>
        <span className="qoe-choice__count">{options.length} item{options.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="qoe-choice__list">
        {options.map((opt, i) => (
          <div key={i} className="qoe-choice__item">
            <button
              type="button"
              className="qoe-choice__drag"
              title="Reorder"
              onMouseDown={(e) => e.preventDefault()}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="4" cy="3" r="1" fill="#c7c7cc" />
                <circle cx="8" cy="3" r="1" fill="#c7c7cc" />
                <circle cx="4" cy="6" r="1" fill="#c7c7cc" />
                <circle cx="8" cy="6" r="1" fill="#c7c7cc" />
                <circle cx="4" cy="9" r="1" fill="#c7c7cc" />
                <circle cx="8" cy="9" r="1" fill="#c7c7cc" />
              </svg>
            </button>
            {iconEl(i)}
            <input
              className="qoe-choice__input"
              value={opt.optionText}
              onChange={(e) => updateOptionText(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            <div className="qoe-choice__item-actions">
              <button
                type="button"
                className="qoe-choice__move-btn"
                onClick={() => moveOption(i, -1)}
                disabled={i === 0}
                title="Move up"
              >
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 3L2 7h8L6 3z" fill="currentColor" /></svg>
              </button>
              <button
                type="button"
                className="qoe-choice__move-btn"
                onClick={() => moveOption(i, 1)}
                disabled={i === options.length - 1}
                title="Move down"
              >
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 9L2 5h8L6 9z" fill="currentColor" /></svg>
              </button>
              <button type="button" className="qoe-choice__remove-btn" onClick={() => removeOption(i)} title="Remove">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="qoe-choice__add-row">
        {iconEl(options.length)}
        <input
          className="qoe-choice__input qoe-choice__input--new"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add an option..."
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
        />
        <button type="button" className="qoe-choice__add-btn" onClick={addOption} title="Add option">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ─── Rating Scale ─── */
function RatingScaleEditor({ question, onChange }: QuestionOptionsEditorProps) {
  const options = question.options || []
  const scaleSize = options.length || 5

  const initScale = (size: number) => {
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    const opts: SurveyOption[] = Array.from({ length: size }, (_, i) => ({
      optionText: i < labels.length ? labels[i] : `Option ${i + 1}`,
      optionValue: i + 1,
      sortOrder: i + 1,
    }))
    onChange({ ...question, options: opts })
  }

  const updateLabel = (idx: number, text: string) => {
    const updated = options.map((o, i) => (i === idx ? { ...o, optionText: text } : o))
    onChange({ ...question, options: updated })
  }

  if (options.length === 0) {
    return (
      <div className="qoe-rating">
        <div className="qoe-rating__init">
          <p className="qoe-rating__init-text">Set up your rating scale</p>
          <div className="qoe-rating__init-actions">
            {[3, 5, 7, 10].map((n) => (
              <button key={n} type="button" className="qoe-rating__init-btn" onClick={() => initScale(n)}>
                {n}-point
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qoe-rating">
      <div className="qoe-rating__label">
        <span className="qoe-rating__label-text">Scale points</span>
        <div className="qoe-rating__size-controls">
          <button
            type="button"
            className="qoe-rating__size-btn"
            disabled={scaleSize <= 2}
            onClick={() => onChange({ ...question, options: options.slice(0, -1) })}
          >−</button>
          <span className="qoe-rating__size-value">{scaleSize}</span>
          <button
            type="button"
            className="qoe-rating__size-btn"
            disabled={scaleSize >= 10}
            onClick={() => {
              const next: SurveyOption = {
                optionText: `Option ${scaleSize + 1}`,
                optionValue: scaleSize + 1,
                sortOrder: scaleSize + 1,
              }
              onChange({ ...question, options: [...options, next] })
            }}
          >+</button>
        </div>
      </div>
      <div className="qoe-rating__scale">
        {options.map((opt, i) => (
          <div key={i} className="qoe-rating__point">
            <span className="qoe-rating__point-value">{opt.optionValue}</span>
            <input
              className="qoe-rating__point-label"
              value={opt.optionText}
              onChange={(e) => updateLabel(i, e.target.value)}
              placeholder={`Label ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Sliding Scale ─── */
function SlidingScaleEditor({ question, onChange }: QuestionOptionsEditorProps) {
  const opts = question.options || []
  const min = opts[0]?.optionValue ?? 0
  const max = opts[1]?.optionValue ?? 100
  const minLabel = opts[0]?.optionText ?? 'Minimum'
  const maxLabel = opts[1]?.optionText ?? 'Maximum'

  const update = (field: string, value: string | number) => {
    const o: SurveyOption[] = [
      { optionText: field === 'minLabel' ? String(value) : minLabel, optionValue: field === 'min' ? Number(value) : min, sortOrder: 1 },
      { optionText: field === 'maxLabel' ? String(value) : maxLabel, optionValue: field === 'max' ? Number(value) : max, sortOrder: 2 },
    ]
    onChange({ ...question, options: o })
  }

  return (
    <div className="qoe-slider">
      <div className="qoe-slider__label">Slider range</div>
      <div className="qoe-slider__preview">
        <div className="qoe-slider__track">
          <div className="qoe-slider__fill" style={{ width: '50%' }} />
          <div className="qoe-slider__thumb" style={{ left: '50%' }} />
        </div>
        <div className="qoe-slider__labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <div className="qoe-slider__fields">
        <div className="qoe-slider__field">
          <label className="qoe-slider__field-label">Min value</label>
          <input className="qoe-slider__field-input" type="number" value={min} onChange={(e) => update('min', e.target.value)} />
        </div>
        <div className="qoe-slider__field">
          <label className="qoe-slider__field-label">Min label</label>
          <input className="qoe-slider__field-input" type="text" value={minLabel} onChange={(e) => update('minLabel', e.target.value)} />
        </div>
        <div className="qoe-slider__field">
          <label className="qoe-slider__field-label">Max value</label>
          <input className="qoe-slider__field-input" type="number" value={max} onChange={(e) => update('max', e.target.value)} />
        </div>
        <div className="qoe-slider__field">
          <label className="qoe-slider__field-label">Max label</label>
          <input className="qoe-slider__field-input" type="text" value={maxLabel} onChange={(e) => update('maxLabel', e.target.value)} />
        </div>
      </div>
    </div>
  )
}

/* ─── Grid Rating Scale ─── */
function GridRatingEditor({ question, onChange }: QuestionOptionsEditorProps) {
  const [newRow, setNewRow] = useState('')
  const [newCol, setNewCol] = useState('')
  const options = question.options || []
  // Convention: rows have sortOrder < 1000, columns have sortOrder >= 1000
  const rows = options.filter(o => o.sortOrder < 1000)
  const cols = options.filter(o => o.sortOrder >= 1000)

  const addRow = () => {
    const text = newRow.trim() || `Row ${rows.length + 1}`
    const opt: SurveyOption = { optionText: text, optionValue: rows.length + 1, sortOrder: rows.length + 1 }
    onChange({ ...question, options: [...options, opt] })
    setNewRow('')
  }

  const addCol = () => {
    const text = newCol.trim() || `Column ${cols.length + 1}`
    const opt: SurveyOption = { optionText: text, optionValue: cols.length + 1, sortOrder: 1000 + cols.length + 1 }
    onChange({ ...question, options: [...options, opt] })
    setNewCol('')
  }

  const removeOption = (idx: number) => {
    onChange({ ...question, options: options.filter((_, i) => i !== idx) })
  }

  return (
    <div className="qoe-grid">
      <div className="qoe-grid__section">
        <div className="qoe-grid__section-header">
          <span className="qoe-grid__section-title">Row labels</span>
          <span className="qoe-grid__section-count">{rows.length}</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="qoe-grid__item">
            <span className="qoe-grid__item-num">{i + 1}</span>
            <span className="qoe-grid__item-text">{r.optionText}</span>
            <button type="button" className="qoe-choice__remove-btn" onClick={() => removeOption(options.indexOf(r))}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
        <div className="qoe-grid__add-row">
          <input
            className="qoe-choice__input qoe-choice__input--new"
            value={newRow}
            onChange={(e) => setNewRow(e.target.value)}
            placeholder="Add row label..."
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRow() } }}
          />
          <button type="button" className="qoe-choice__add-btn" onClick={addRow} title="Add row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      <div className="qoe-grid__section">
        <div className="qoe-grid__section-header">
          <span className="qoe-grid__section-title">Column labels</span>
          <span className="qoe-grid__section-count">{cols.length}</span>
        </div>
        {cols.map((c, i) => (
          <div key={i} className="qoe-grid__item">
            <span className="qoe-grid__item-num">{i + 1}</span>
            <span className="qoe-grid__item-text">{c.optionText}</span>
            <button type="button" className="qoe-choice__remove-btn" onClick={() => removeOption(options.indexOf(c))}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
        <div className="qoe-grid__add-row">
          <input
            className="qoe-choice__input qoe-choice__input--new"
            value={newCol}
            onChange={(e) => setNewCol(e.target.value)}
            placeholder="Add column label..."
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCol() } }}
          />
          <button type="button" className="qoe-choice__add-btn" onClick={addCol} title="Add column">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {rows.length > 0 && cols.length > 0 && (
        <div className="qoe-grid__preview">
          <div className="qoe-grid__preview-label">Preview</div>
          <table className="qoe-grid__table">
            <thead>
              <tr>
                <th></th>
                {cols.map((c, i) => <th key={i}>{c.optionText}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="qoe-grid__row-label">{r.optionText}</td>
                  {cols.map((_, j) => (
                    <td key={j}><span className="qoe-grid__radio" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Text fields (Single-line / Textarea) ─── */
function TextFieldEditor({ multiline }: QuestionOptionsEditorProps & { multiline: boolean }) {
  return (
    <div className="qoe-text">
      <div className="qoe-text__preview">
        {multiline ? (
          <div className="qoe-text__textarea-preview">
            <span className="qoe-text__placeholder">Respondents will type their answer here...</span>
            <div className="qoe-text__lines">
              <div /><div /><div />
            </div>
          </div>
        ) : (
          <div className="qoe-text__input-preview">
            <span className="qoe-text__placeholder">Respondents will type their answer here...</span>
          </div>
        )}
      </div>
      <div className="qoe-text__hint">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5h1.5v1.5h-1.5V5zm0 3h1.5v3h-1.5V8z" fill="currentColor"/></svg>
        {multiline
          ? 'Respondents can enter multiple lines of free-form text.'
          : 'Respondents can enter a single line of text.'}
      </div>
    </div>
  )
}

/* ─── Static Text ─── */
function StaticTextEditor({ question, onChange }: QuestionOptionsEditorProps) {
  return (
    <div className="qoe-static">
      <div className="qoe-static__label">Static content</div>
      <textarea
        className="qoe-static__textarea"
        value={question.questionDescription || ''}
        onChange={(e) => onChange({ ...question, questionDescription: e.target.value })}
        placeholder="Enter informational text to display to respondents..."
        rows={4}
      />
      <div className="qoe-text__hint">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5h1.5v1.5h-1.5V5zm0 3h1.5v3h-1.5V8z" fill="currentColor"/></svg>
        This text block will be displayed as-is — respondents cannot interact with it.
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main dispatcher
   ═══════════════════════════════════════ */

export default function QuestionOptionsEditor({ question, onChange }: QuestionOptionsEditorProps) {
  const type = normalize(question.questionType)

  const typeLabel = question.questionType || 'Unknown'
  const typeIcon = getTypeIcon(type)

  return (
    <div className="qoe">
      <div className="qoe__header">
        <span className="qoe__type-badge">
          {typeIcon}
          {typeLabel}
        </span>
      </div>
      <div className="qoe__body">
        {renderEditor(type, question, onChange)}
      </div>
    </div>
  )
}

function renderEditor(type: string, question: SurveyQuestion, onChange: (q: SurveyQuestion) => void) {
  switch (type) {
    case 'checkboxes':
      return <ChoiceOptionsEditor question={question} onChange={onChange} icon="checkbox" />
    case 'multiselect':
      return <ChoiceOptionsEditor question={question} onChange={onChange} icon="checkbox" />
    case 'radiobuttons':
      return <ChoiceOptionsEditor question={question} onChange={onChange} icon="radio" />
    case 'singleselect':
      return <ChoiceOptionsEditor question={question} onChange={onChange} icon="select" />
    case 'ratingscale':
      return <RatingScaleEditor question={question} onChange={onChange} />
    case 'slidingscale':
      return <SlidingScaleEditor question={question} onChange={onChange} />
    case 'gridratingscale':
      return <GridRatingEditor question={question} onChange={onChange} />
    case 'singlelineinput':
      return <TextFieldEditor question={question} onChange={onChange} multiline={false} />
    case 'textarea':
      return <TextFieldEditor question={question} onChange={onChange} multiline={true} />
    case 'statictext':
      return <StaticTextEditor question={question} onChange={onChange} />
    default:
      return (
        <div className="qoe-text__hint">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5h1.5v1.5h-1.5V5zm0 3h1.5v3h-1.5V8z" fill="currentColor"/></svg>
          Select a question type to configure options.
        </div>
      )
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'checkboxes':
    case 'multiselect':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'radiobuttons':
    case 'singleselect':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="3" fill="currentColor" /></svg>
    case 'ratingscale':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.4 3.5 14.7l.9-5L.8 6.2l5-.7L8 1z" fill="currentColor" /></svg>
    case 'slidingscale':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" /><circle cx="9" cy="8" r="3" fill="currentColor" stroke="white" strokeWidth="1.5" /></svg>
    case 'gridratingscale':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg>
    case 'singlelineinput':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" /><line x1="4" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
    case 'textarea':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" /><line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="4" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
    case 'statictext':
      return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5h1.5v1.5h-1.5V5zm0 3h1.5v3h-1.5V8z" fill="currentColor"/></svg>
    default:
      return null
  }
}
