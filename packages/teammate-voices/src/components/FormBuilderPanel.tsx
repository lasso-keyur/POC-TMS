import { useState } from 'react'
import { Button } from '../design-system'
import SurveyPageEditor from '@/components/SurveyPageEditor'
import type { SurveyPage } from '@/types/survey'

interface FormBuilderPanelProps {
  pages: SurveyPage[]
  onPagesChange: (pages: SurveyPage[]) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  saveMessage?: string
  detailsComplete?: boolean
}

function generatePageId(pages: SurveyPage[]): string {
  const num = pages.length + 1
  return `PGID-${String(num).padStart(3, '0')}`
}

function createEmptyPage(pages: SurveyPage[]): SurveyPage {
  return {
    pageId: generatePageId(pages),
    title: '',
    label: '',
    description: '',
    showDescription: false,
    sortOrder: pages.length + 1,
    questions: [],
  }
}

export default function FormBuilderPanel({ pages, onPagesChange, onSave, onCancel, saving, saveMessage, detailsComplete = true }: FormBuilderPanelProps) {
  const [activePageIdx, setActivePageIdx] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleAddPage = () => {
    const newPage = createEmptyPage(pages)
    const updated = [...pages, newPage]
    onPagesChange(updated)
    setActivePageIdx(updated.length - 1)
  }

  const handleUpdatePage = (updatedPage: SurveyPage) => {
    const updated = pages.map((p, i) => i === activePageIdx ? updatedPage : p)
    onPagesChange(updated)
  }

  const handleDuplicatePage = () => {
    if (activePageIdx < 0 || activePageIdx >= pages.length) return
    const source = pages[activePageIdx]
    const dup: SurveyPage = {
      ...source,
      pageId: generatePageId(pages),
      title: `${source.title} (Copy)`,
      sortOrder: pages.length + 1,
      questions: source.questions.map(q => ({ ...q, questionId: undefined })),
    }
    const updated = [...pages, dup]
    onPagesChange(updated)
    setActivePageIdx(updated.length - 1)
  }

  const handleDeletePage = () => {
    if (activePageIdx < 0 || activePageIdx >= pages.length) return
    const updated = pages.filter((_, i) => i !== activePageIdx)
    onPagesChange(updated)
    setActivePageIdx(Math.max(0, activePageIdx - 1))
  }

  const activePage = pages[activePageIdx]

  return (
    <div>
      <div className="form-builder">
        {sidebarOpen && (
          <div className="form-builder__sidebar">
            <h3 className="form-builder__sidebar-title">
              Page hierarchy
              <button className="form-builder__collapse-btn" onClick={() => setSidebarOpen(false)}>
                &#8963;
              </button>
            </h3>
            {pages.length === 0 ? (
              <p className="form-builder__empty-text">No pages available</p>
            ) : (
              <ul className="form-builder__page-list">
                {pages.map((page, idx) => (
                  <li key={page.pageId}>
                    <div
                      className={`form-builder__page-item${idx === activePageIdx ? ' form-builder__page-item--active' : ''}`}
                      onClick={() => setActivePageIdx(idx)}
                    >
                      {page.title || page.label || page.pageId}
                    </div>
                    {idx === activePageIdx && page.questions.length > 0 && (
                      <ul className="form-builder__question-tree">
                        <li className="form-builder__tree-label">Questions</li>
                        {page.questions.map((q, qIdx) => (
                          <li key={q.questionId ?? qIdx} className="form-builder__tree-question">
                            {q.questionLabel || q.questionText || `Question ${qIdx + 1}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!sidebarOpen && (
          <button
            className="form-builder__collapse-btn"
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onClick={() => setSidebarOpen(true)}
          >
            &#8964;
          </button>
        )}

        <div className="form-builder__main">
          {pages.length === 0 ? (
            <div className="form-builder__empty-state">
              <h3 className="form-builder__empty-title">Your form is empty</h3>
              <p className="form-builder__empty-message">
                {detailsComplete
                  ? "Use the 'Add page' button to start building your survey."
                  : 'Please complete the Details tab (survey name) before adding pages.'}
              </p>
              <Button variant="secondary" onClick={handleAddPage} disabled={!detailsComplete}>
                Add Page
              </Button>
            </div>
          ) : activePage ? (
            <SurveyPageEditor
              page={activePage}
              onUpdate={handleUpdatePage}
              onDuplicate={handleDuplicatePage}
              onDelete={handleDeletePage}
            />
          ) : null}
        </div>
      </div>

      <div className="form-builder__bottom-actions">
        {saveMessage && <span className="survey-editor__save-message">{saveMessage}</span>}
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" size="sm" onClick={handleAddPage} disabled={!detailsComplete}>Add Page</Button>
        <Button variant="primary" size="sm" onClick={onSave} loading={saving} disabled={!detailsComplete}>Save</Button>
      </div>
    </div>
  )
}
