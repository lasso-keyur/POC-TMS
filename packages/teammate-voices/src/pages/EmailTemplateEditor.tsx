import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../design-system'
import Breadcrumb from '@/components/Breadcrumb'
import TabBar from '@/components/TabBar'
import FormField from '@/components/FormField'
import ToggleSwitch from '@/components/ToggleSwitch'
import { api } from '@/services/api'
import type { EmailTemplate, EmailCategory, EmailTemplateAssignment } from '@/types/emailTemplate'
import { EMAIL_CATEGORIES, TRIGGER_TYPES } from '@/types/emailTemplate'
import type { Survey } from '@/types/survey'

type EditorTab = 'details' | 'builder' | 'preview' | 'settings'

const TABS: { key: EditorTab; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'builder', label: 'Template Builder' },
  { key: 'preview', label: 'Preview' },
  { key: 'settings', label: 'Settings' },
]

const MERGE_FIELDS: Record<string, { field: string; label: string }[]> = {
  Participant: [
    { field: '{{participant_name}}', label: 'Name' },
    { field: '{{email}}', label: 'Email' },
    { field: '{{person_number}}', label: 'Person Number' },
    { field: '{{standard_id}}', label: 'Standard ID' },
    { field: '{{manager_name}}', label: 'Manager' },
    { field: '{{cohort}}', label: 'Cohort' },
  ],
  Survey: [
    { field: '{{survey_title}}', label: 'Survey Title' },
    { field: '{{survey_link}}', label: 'Survey Link' },
    { field: '{{survey_due_date}}', label: 'Due Date' },
  ],
  Program: [
    { field: '{{program_name}}', label: 'Program Name' },
    { field: '{{company_name}}', label: 'Company' },
  ],
  Sender: [
    { field: '{{sender_name}}', label: 'Sender Name' },
    { field: '{{sender_email}}', label: 'Sender Email' },
  ],
}

const SAMPLE_DATA: Record<string, string> = {
  '{{participant_name}}': 'Jane Smith',
  '{{email}}': 'jane.smith@example.com',
  '{{person_number}}': 'P00123',
  '{{standard_id}}': 'STD-4567',
  '{{manager_name}}': 'Robert Johnson',
  '{{cohort}}': 'Spring 2026',
  '{{participant_type}}': 'NEW_HIRE',
  '{{survey_title}}': 'Employee Voice Survey 2026',
  '{{survey_link}}': 'https://surveys.example.com/respond/abc123',
  '{{survey_due_date}}': 'April 15, 2026',
  '{{survey_description}}': 'Annual engagement and sentiment survey',
  '{{program_name}}': 'Teammate Voices',
  '{{program_description}}': 'Employee feedback program',
  '{{company_name}}': 'Acme Corporation',
  '{{sender_name}}': 'HR Team',
  '{{sender_title}}': 'People & Culture',
  '{{sender_email}}': 'hr@acme.com',
}

function replaceMergeFields(html: string): string {
  let result = html
  for (const [field, value] of Object.entries(SAMPLE_DATA)) {
    result = result.split(field).join(value)
  }
  // Remove conditional blocks for preview (simplified)
  result = result.replace(/\{\{#if[^}]*\}\}/g, '').replace(/\{\{\/if\}\}/g, '')
  return result
}

export default function EmailTemplateEditor() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const isEditMode = !!templateId
  const editorRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<EditorTab>('details')
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [mergeDropdownOpen, setMergeDropdownOpen] = useState(false)

  // Template state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EmailCategory>('CUSTOM')
  const [subject, setSubject] = useState('')
  const [fromName, setFromName] = useState('Teammate Voices')
  const [bodyHtml, setBodyHtml] = useState('<p>Start typing your email content here...</p>')
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  // Assignment state (Settings tab)
  const [assignments, setAssignments] = useState<EmailTemplateAssignment[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [newTrigger, setNewTrigger] = useState('')
  const [newSurveyId, setNewSurveyId] = useState<number | ''>('')
  const [newDelayDays, setNewDelayDays] = useState(0)

  // Load surveys for assignment dropdowns
  useEffect(() => {
    api.getSurveys().then(setSurveys).catch(() => {})
  }, [])

  // Load assignments when template is loaded
  useEffect(() => {
    if (!templateId) return
    api.getTemplateAssignments(Number(templateId))
      .then(setAssignments)
      .catch(() => {})
  }, [templateId])

  const handleAddAssignment = async () => {
    if (!templateId || !newTrigger || !newSurveyId) {
      alert('Please select both a trigger type and a survey.')
      return
    }
    try {
      const saved = await api.saveTemplateAssignment(Number(templateId), {
        triggerType: newTrigger,
        surveyId: Number(newSurveyId),
        sendDelayDays: newDelayDays,
        isActive: true,
      })
      setAssignments(prev => [...prev.filter(a => a.assignmentId !== saved.assignmentId), saved])
      setNewTrigger('')
      setNewSurveyId('')
      setNewDelayDays(0)
    } catch (err) {
      alert('Failed to save assignment.')
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    try {
      await api.deleteTemplateAssignment(assignmentId)
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId))
    } catch {
      alert('Failed to delete assignment.')
    }
  }

  // Load template in edit mode
  useEffect(() => {
    if (!templateId) return
    api.getEmailTemplate(Number(templateId))
      .then(t => {
        setName(t.name)
        setDescription(t.description || '')
        setCategory(t.category)
        setSubject(t.subject)
        setFromName(t.fromName || 'Teammate Voices')
        setBodyHtml(t.bodyHtml)
        setStatus(t.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT')
      })
      .catch(() => navigate('/templates'))
      .finally(() => setLoading(false))
  }, [templateId, navigate])

  // Sync editor content
  useEffect(() => {
    if (editorRef.current && activeTab === 'builder') {
      editorRef.current.innerHTML = bodyHtml
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML)
    }
  }, [])

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertMergeField = (field: string) => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const span = document.createElement('span')
      span.className = 'merge-field-chip'
      span.contentEditable = 'false'
      span.dataset.field = field
      span.textContent = field
      range.deleteContents()
      range.insertNode(span)
      // Move cursor after the inserted span
      range.setStartAfter(span)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    setMergeDropdownOpen(false)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertCardBlock = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const card = document.createElement('div')
      card.className = 'email-card-block'
      card.setAttribute('contenteditable', 'true')
      card.innerHTML = '<p>Type your card content here...</p>'
      range.deleteContents()
      range.insertNode(card)
      // Move cursor inside the card
      const p = card.querySelector('p')
      if (p) {
        const newRange = document.createRange()
        newRange.selectNodeContents(p)
        sel.removeAllRanges()
        sel.addRange(newRange)
      }
    }
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertDivider = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const hr = document.createElement('hr')
      hr.className = 'email-divider'
      range.deleteContents()
      range.insertNode(hr)
      range.setStartAfter(hr)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertButton = () => {
    const text = prompt('Button text:', 'Click Here')
    if (!text) return
    const url = prompt('Button link URL:', 'https://')
    if (!url) return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const btn = document.createElement('a')
      btn.href = url
      btn.className = 'email-cta-button'
      btn.textContent = text
      btn.setAttribute('target', '_blank')
      range.deleteContents()
      range.insertNode(btn)
      range.setStartAfter(btn)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    editorRef.current?.focus()
    handleEditorInput()
  }

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      alert('Template name and subject line are required.')
      return
    }
    setSaving(true)
    setSaveMessage('')
    try {
      const payload: Partial<EmailTemplate> = {
        name: name.trim(),
        description: description.trim(),
        category,
        subject: subject.trim(),
        fromName: fromName.trim(),
        bodyHtml,
        status,
      }
      if (isEditMode) {
        await api.updateEmailTemplate(Number(templateId), payload)
        setSaveMessage('Template saved!')
      } else {
        const created = await api.createEmailTemplate(payload)
        setSaveMessage('Template created!')
        setTimeout(() => navigate(`/templates/${created.templateId}/edit`), 1500)
      }
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setSaveMessage('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading template...</p>
  }

  return (
    <div className="email-editor">
      <Breadcrumb items={[
        { label: 'Administration', path: '/admin' },
        { label: 'Email Templates', path: '/templates' },
        { label: isEditMode ? name || 'Edit template' : 'Create template' },
      ]} />

      <div className="email-editor__header">
        <div>
          <h1 className="email-editor__title">{isEditMode ? name || 'Edit Template' : 'Create Template'}</h1>
          <span className={`email-editor__status email-editor__status--${status.toLowerCase()}`}>
            {status === 'ACTIVE' ? 'Active' : 'Draft'}
          </span>
        </div>
        <div className="email-editor__header-actions">
          <Button variant="secondary" size="sm" onClick={() => navigate('/templates')}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {isEditMode ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className={`email-editor__message${saveMessage.includes('Failed') ? ' email-editor__message--error' : ''}`}>
          {saveMessage}
        </div>
      )}

      <div className="email-editor__card">
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as EditorTab)}
        />

        {/* ===== DETAILS TAB ===== */}
        {activeTab === 'details' && (
          <div className="email-editor__form">
            <div className="email-editor__form-row">
              <FormField label="Template Name" required>
                <input className="email-editor__input" placeholder="e.g., Survey Invitation" value={name} onChange={e => setName(e.target.value)} />
              </FormField>
              <FormField label="Category" required>
                <select className="email-editor__select" value={category} onChange={e => setCategory(e.target.value as EmailCategory)}>
                  {EMAIL_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Description">
              <input className="email-editor__input" placeholder="Brief description of this template" value={description} onChange={e => setDescription(e.target.value)} />
            </FormField>
            <div className="email-editor__form-row">
              <FormField label="Subject Line" required>
                <input className="email-editor__input" placeholder="e.g., You are invited to complete: {{survey_title}}" value={subject} onChange={e => setSubject(e.target.value)} />
              </FormField>
              <FormField label="From Name">
                <input className="email-editor__input" placeholder="Teammate Voices" value={fromName} onChange={e => setFromName(e.target.value)} />
              </FormField>
            </div>
            <div className="email-editor__form-row">
              <div>
                <span className="email-editor__field-label">Status</span>
                <ToggleSwitch label={status === 'ACTIVE' ? 'Active' : 'Draft'} checked={status === 'ACTIVE'} onChange={v => setStatus(v ? 'ACTIVE' : 'DRAFT')} />
              </div>
            </div>
          </div>
        )}

        {/* ===== TEMPLATE BUILDER TAB ===== */}
        {activeTab === 'builder' && (
          <div className="email-editor__builder">
            {/* Toolbar */}
            <div className="wysiwyg-toolbar">
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('bold')} title="Bold"><b>B</b></button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('italic')} title="Italic"><i>I</i></button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('underline')} title="Underline"><u>U</u></button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('strikeThrough')} title="Strikethrough"><s>S</s></button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('formatBlock', 'h1')} title="Heading 1">H1</button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2">H2</button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('formatBlock', 'p')} title="Paragraph">P</button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">• List</button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List">1. List</button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('justifyLeft')} title="Align Left">⫷</button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('justifyCenter')} title="Align Center">≡</button>
                <button className="wysiwyg-toolbar__btn" onClick={() => execCommand('justifyRight')} title="Align Right">⫸</button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={() => {
                  const url = prompt('Enter link URL:')
                  if (url) execCommand('createLink', url)
                }} title="Insert Link">🔗</button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              <div className="wysiwyg-toolbar__group">
                <button className="wysiwyg-toolbar__btn" onClick={insertCardBlock} title="Insert Card Block">▢ Card</button>
                <button className="wysiwyg-toolbar__btn" onClick={insertButton} title="Insert Button">▣ Button</button>
                <button className="wysiwyg-toolbar__btn" onClick={insertDivider} title="Insert Divider">― Line</button>
              </div>
              <div className="wysiwyg-toolbar__separator" />
              {/* Merge field dropdown */}
              <div className="wysiwyg-toolbar__group" style={{ position: 'relative' }}>
                <button
                  className="wysiwyg-toolbar__btn wysiwyg-toolbar__btn--merge"
                  onClick={() => setMergeDropdownOpen(!mergeDropdownOpen)}
                >
                  + Merge Field ▾
                </button>
                {mergeDropdownOpen && (
                  <div className="merge-dropdown">
                    {Object.entries(MERGE_FIELDS).map(([group, fields]) => (
                      <div key={group} className="merge-dropdown__group">
                        <div className="merge-dropdown__group-label">{group}</div>
                        {fields.map(f => (
                          <button key={f.field} className="merge-dropdown__item" onClick={() => insertMergeField(f.field)}>
                            <span className="merge-dropdown__item-label">{f.label}</span>
                            <code className="merge-dropdown__item-field">{f.field}</code>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor area styled as email */}
            <div className="wysiwyg-editor__wrapper">
              <div
                ref={editorRef}
                className="wysiwyg-editor"
                contentEditable
                onInput={handleEditorInput}
                onBlur={handleEditorInput}
                suppressContentEditableWarning
              />
            </div>
          </div>
        )}

        {/* ===== PREVIEW TAB ===== */}
        {activeTab === 'preview' && (
          <div className="email-editor__preview">
            <div className="email-editor__preview-toolbar">
              <button className={`email-editor__preview-toggle${previewMode === 'desktop' ? ' email-editor__preview-toggle--active' : ''}`} onClick={() => setPreviewMode('desktop')}>Desktop</button>
              <button className={`email-editor__preview-toggle${previewMode === 'mobile' ? ' email-editor__preview-toggle--active' : ''}`} onClick={() => setPreviewMode('mobile')}>Mobile</button>
            </div>
            <div className="email-editor__preview-subject">
              <strong>Subject:</strong> {replaceMergeFields(subject)}
            </div>
            <div className="email-editor__preview-from">
              <strong>From:</strong> {fromName} &lt;noreply@teammatevoices.com&gt;
            </div>
            <div className={`email-editor__preview-frame email-editor__preview-frame--${previewMode}`}>
              <div dangerouslySetInnerHTML={{ __html: replaceMergeFields(bodyHtml) }} />
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div className="email-editor__form">
            <p style={{ color: '#86868b', fontSize: 14, marginBottom: 24 }}>
              Assign this template to surveys. Configure the trigger event and send delay.
            </p>

            {/* Existing Assignments */}
            {assignments.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 12 }}>Current Assignments</h3>
                <table className="assignment-table">
                  <thead>
                    <tr>
                      <th>Survey</th>
                      <th>Trigger</th>
                      <th>Delay (days)</th>
                      <th>Status</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const survey = surveys.find(s => s.surveyId === a.surveyId)
                      const trigger = TRIGGER_TYPES.find(t => t.value === a.triggerType)
                      return (
                        <tr key={a.assignmentId}>
                          <td>{survey?.title || `Survey #${a.surveyId}`}</td>
                          <td>
                            <span className="assignment-trigger-pill">{trigger?.label || a.triggerType}</span>
                          </td>
                          <td>{a.sendDelayDays || 0}</td>
                          <td>
                            <span className={`assignment-status ${a.isActive ? 'assignment-status--active' : 'assignment-status--inactive'}`}>
                              {a.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="assignment-delete-btn"
                              onClick={() => handleDeleteAssignment(a.assignmentId)}
                              title="Remove assignment"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add New Assignment */}
            {isEditMode && (
              <div style={{ border: '1px solid #d2d2d7', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 16 }}>Add Assignment</h3>
                <div className="email-editor__form-row" style={{ gap: 16 }}>
                  <FormField label="Survey">
                    <select
                      className="email-editor__select"
                      value={newSurveyId}
                      onChange={e => setNewSurveyId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">Select survey...</option>
                      {surveys.map(s => (
                        <option key={s.surveyId} value={s.surveyId}>{s.title}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Trigger Event">
                    <select
                      className="email-editor__select"
                      value={newTrigger}
                      onChange={e => setNewTrigger(e.target.value)}
                    >
                      <option value="">Select trigger...</option>
                      {TRIGGER_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Delay (days)">
                    <input
                      className="email-editor__input"
                      type="number"
                      min={0}
                      max={365}
                      value={newDelayDays}
                      onChange={e => setNewDelayDays(Number(e.target.value))}
                      style={{ width: 100 }}
                    />
                  </FormField>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button variant="primary" size="sm" onClick={handleAddAssignment}>
                    + Add Assignment
                  </Button>
                </div>
              </div>
            )}

            {!isEditMode && (
              <div style={{ padding: 40, textAlign: 'center', color: '#86868b', border: '1px dashed #d2d2d7', borderRadius: 12 }}>
                <p style={{ fontSize: 14 }}>Save the template first, then you can add survey assignments.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
