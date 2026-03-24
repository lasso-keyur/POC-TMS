import { useState } from 'react'
import { Input, Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../design-system'
import FormField from '@/components/FormField'
import ToggleSwitch from '@/components/ToggleSwitch'
import QuestionOptionsEditor from '@/components/QuestionOptionsEditor'
import QuestionConfigPanel from '@/components/QuestionConfigPanel'
import type { SurveyPage, SurveyQuestion } from '@/types/survey'
import { QUESTION_TYPES } from '@/types/survey'

interface SurveyPageEditorProps {
  page: SurveyPage
  onUpdate: (page: SurveyPage) => void
  onDuplicate: () => void
  onDelete: () => void
  onConfigure?: () => void
}

function generateQuestionId(questions: SurveyQuestion[]): string {
  const num = questions.length + 1
  return `QUID-${String(num).padStart(3, '0')}`
}

export default function SurveyPageEditor({ page, onUpdate, onDuplicate, onDelete, onConfigure }: SurveyPageEditorProps) {
  const [configuringIdx, setConfiguringIdx] = useState<number | null>(null)

  const updateField = <K extends keyof SurveyPage>(field: K, value: SurveyPage[K]) => {
    onUpdate({ ...page, [field]: value })
  }

  const updateQuestion = (idx: number, updated: SurveyQuestion) => {
    const questions = page.questions.map((q, i) => i === idx ? updated : q)
    onUpdate({ ...page, questions })
  }

  const addQuestion = (type: string) => {
    const newQ: SurveyQuestion = {
      questionText: '',
      questionType: type,
      questionLabel: '',
      questionDescription: '',
      showDescription: false,
      sortOrder: page.questions.length + 1,
      isRequired: false,
      options: [],
    }
    onUpdate({ ...page, questions: [...page.questions, newQ] })
  }

  const toggleRequired = (idx: number) => {
    const q = page.questions[idx]
    updateQuestion(idx, { ...q, isRequired: !q.isRequired })
  }

  const duplicateQuestion = (idx: number) => {
    const q = page.questions[idx]
    const dup: SurveyQuestion = {
      ...q,
      questionId: undefined,
      questionLabel: (q.questionLabel || '') + ' (Copy)',
      sortOrder: page.questions.length + 1,
    }
    onUpdate({ ...page, questions: [...page.questions, dup] })
  }

  const deleteQuestion = (idx: number) => {
    const questions = page.questions.filter((_, i) => i !== idx)
    onUpdate({ ...page, questions })
  }

  return (
    <div className="page-editor">
      <div className="page-editor__header">
        <span className="page-editor__id">{page.pageId}</span>
        <div className="page-editor__actions">
          {onConfigure && (
            <button className="page-editor__action-btn" onClick={onConfigure}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 2.5L9.5 2.5M6.5 8L9.5 8M6.5 13.5L9.5 13.5M3 5L13 5M3 10.5L13 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Configure
            </button>
          )}
          <button className="page-editor__action-btn" onClick={onDuplicate}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2H12.5A1.5 1.5 0 0114 3.5V9.5A1.5 1.5 0 0112.5 11H11" stroke="currentColor" strokeWidth="1.2"/></svg>
            Duplicate
          </button>
          <button className="page-editor__action-btn" onClick={onDelete}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4.5H13M5.5 4.5V3A1.5 1.5 0 017 1.5H9A1.5 1.5 0 0110.5 3V4.5M6 7V11.5M8 7V11.5M10 7V11.5M4.5 4.5L5 13.5A1.5 1.5 0 006.5 15H9.5A1.5 1.5 0 0011 13.5L11.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Delete
          </button>
        </div>
      </div>

      <div className="page-editor__fields">
        <FormField label="Page Title" required>
          <Input
            id={`${page.pageId}-title`}
            value={page.title}
            onChange={(e) => updateField('title', e.target.value)}
            fullWidth
          />
        </FormField>

        <div className="page-editor__description-row">
          <span className="page-editor__description-label">Page description</span>
          <ToggleSwitch
            label=""
            checked={page.showDescription}
            onChange={(checked) => updateField('showDescription', checked)}
          />
        </div>

        {page.showDescription && (
          <FormField label="Description">
            <Input
              id={`${page.pageId}-desc`}
              value={page.description}
              onChange={(e) => updateField('description', e.target.value)}
              fullWidth
            />
          </FormField>
        )}

        <FormField label="Page Label" required helper="More than 40 characters will be condensed.">
          <Input
            id={`${page.pageId}-label`}
            value={page.label}
            onChange={(e) => updateField('label', e.target.value)}
            fullWidth
          />
        </FormField>
      </div>

      {page.questions.length === 0 ? (
        <div className="page-editor__questions-card">
          <p className="page-editor__questions-empty">
            Add a question from the question types dropdown below.
          </p>
        </div>
      ) : (
        <>
          {page.questions.map((q, idx) => {
            const qid = generateQuestionId(page.questions.slice(0, idx))
            return (
              <div key={q.questionId ?? idx} className="page-editor__questions-card">
                <div className="question-editor">
                  <div className="question-editor__header">
                    <span className="question-editor__id">{qid}</span>
                    <div className="question-editor__actions">
                      <button
                        className={`question-editor__action-btn${q.isRequired ? ' question-editor__action-btn--active' : ''}`}
                        onClick={() => toggleRequired(idx)}
                      >
                        ✱ Required
                      </button>
                      <button className={`question-editor__action-btn${configuringIdx === idx ? ' question-editor__action-btn--configuring' : ''}`} onClick={() => setConfiguringIdx(configuringIdx === idx ? null : idx)}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6.5 2.5L9.5 2.5M6.5 8L9.5 8M6.5 13.5L9.5 13.5M3 5L13 5M3 10.5L13 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Configure
                      </button>
                      <button className="question-editor__action-btn" onClick={() => duplicateQuestion(idx)}>
                        ▢ Duplicate
                      </button>
                      <button className="question-editor__action-btn" onClick={() => deleteQuestion(idx)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>

                  <div className="question-editor__fields">
                    <FormField label="Question" required>
                      <Input
                        id={`q-${idx}-text`}
                        placeholder={`Enter Question ${idx + 1}`}
                        value={q.questionText}
                        onChange={(e) => updateQuestion(idx, { ...q, questionText: e.target.value })}
                        fullWidth
                      />
                    </FormField>

                    <div className="page-editor__description-row">
                      <span className="page-editor__description-label">Question description</span>
                      <ToggleSwitch
                        label=""
                        checked={q.showDescription ?? false}
                        onChange={(checked) => updateQuestion(idx, { ...q, showDescription: checked })}
                      />
                    </div>

                    {q.showDescription && (
                      <FormField label="Description">
                        <Input
                          id={`q-${idx}-desc`}
                          value={q.questionDescription || ''}
                          onChange={(e) => updateQuestion(idx, { ...q, questionDescription: e.target.value })}
                          fullWidth
                        />
                      </FormField>
                    )}

                    <FormField label="Question label" helper="More than 40 characters will be condensed.">
                      <Input
                        id={`q-${idx}-label`}
                        value={q.questionLabel || ''}
                        onChange={(e) => updateQuestion(idx, { ...q, questionLabel: e.target.value })}
                        fullWidth
                      />
                    </FormField>
                  </div>

                  {/* type-specific option editor */}
                  <QuestionOptionsEditor
                    question={q}
                    onChange={(updated) => updateQuestion(idx, updated)}
                  />

                  <div className="question-editor__type-section">
                    <FormField label="Question type">
                      <select
                        className="add-question-bar__select"
                        value={q.questionType}
                        onChange={(e) => updateQuestion(idx, { ...q, questionType: e.target.value, options: [] })}
                      >
                        <option value="" disabled>Select Question type</option>
                        {QUESTION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                </div>
              </div>
            )
          })}

          {/* Configuration Modal */}
          {configuringIdx !== null && configuringIdx < page.questions.length && (
            <Modal open={true} onClose={() => setConfiguringIdx(null)} size="lg">
              <ModalHeader>
                <div className="question-config__modal-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Configure: Q{configuringIdx + 1} — {page.questions[configuringIdx].questionText || 'Untitled'}
                </div>
              </ModalHeader>
              <ModalBody>
                <QuestionConfigPanel
                  question={page.questions[configuringIdx]}
                  questionIdx={configuringIdx}
                  allQuestions={page.questions}
                  onChange={(updated) => updateQuestion(configuringIdx, updated)}
                  onClose={() => setConfiguringIdx(null)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="primary" size="sm" onClick={() => setConfiguringIdx(null)}>Done</Button>
              </ModalFooter>
            </Modal>
          )}
        </>
      )}

      {/* Add Question button — outside cards */}
      <button
        type="button"
        className="add-question-bar__btn"
        onClick={() => addQuestion('Checkboxes')}
      >
        Add Question
      </button>
    </div>
  )
}

