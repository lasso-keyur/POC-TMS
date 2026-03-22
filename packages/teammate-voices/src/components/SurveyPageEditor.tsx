import { Input, Button } from '@teammate-voices/design-system'
import FormField from '@/components/FormField'
import ToggleSwitch from '@/components/ToggleSwitch'
import type { SurveyPage } from '@/types/survey'

interface SurveyPageEditorProps {
  page: SurveyPage
  onUpdate: (page: SurveyPage) => void
  onDuplicate: () => void
  onDelete: () => void
  onConfigure?: () => void
}

export default function SurveyPageEditor({ page, onUpdate, onDuplicate, onDelete, onConfigure }: SurveyPageEditorProps) {
  const updateField = <K extends keyof SurveyPage>(field: K, value: SurveyPage[K]) => {
    onUpdate({ ...page, [field]: value })
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
        <FormField label="Page Title" required helper="">
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

        <FormField label="Page Label" required>
          <Input
            id={`${page.pageId}-label`}
            value={page.label}
            onChange={(e) => updateField('label', e.target.value)}
            fullWidth
          />
        </FormField>
      </div>

      <div>
        {page.questions.length === 0 ? (
          <p className="page-editor__questions-empty">
            The page is empty. Add a question type using the button below.
          </p>
        ) : (
          page.questions.map((q, idx) => (
            <div key={q.questionId ?? idx} style={{ padding: '8px 0', borderBottom: '1px solid #e5e5ea' }}>
              <span style={{ fontSize: 13, color: '#86868b' }}>Q{idx + 1} &middot; {q.questionType.replace(/_/g, ' ')}</span>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#1d1d1f' }}>{q.questionText}</p>
            </div>
          ))
        )}

        <div style={{ marginTop: 24 }}>
          <Button variant="secondary" size="sm">Add Question</Button>
        </div>
      </div>
    </div>
  )
}
