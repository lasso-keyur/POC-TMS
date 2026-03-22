import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input } from '@teammate-voices/design-system'
import Breadcrumb from '@/components/Breadcrumb'
import TabBar from '@/components/TabBar'
import StatusPill from '@/components/StatusPill'
import FormField from '@/components/FormField'
import FormBuilderPanel from '@/components/FormBuilderPanel'
import ToggleSwitch from '@/components/ToggleSwitch'
import { api } from '@/services/api'
import type { Survey, SurveyPage, SurveyTab } from '@/types/survey'
import { SURVEY_TABS } from '@/types/survey'
import type { Program } from '@/types/program'

const EMPTY_SURVEY: Partial<Survey> = {
  title: '',
  description: '',
  templateType: 'CUSTOM',
  status: 'DRAFT',
  buildStatus: 'DRAFT',
  participantType: 'ALL',
  surveyStage: 'ONBOARDING',
  audienceSource: 'CSV_UPLOAD',
  autoSend: false,
  isAnonymous: true,
  questions: [],
  pages: [],
}

export default function SurveyEditor() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const isEditMode = !!surveyId

  const [survey, setSurvey] = useState<Partial<Survey>>(EMPTY_SURVEY)
  const [programs, setPrograms] = useState<Program[]>([])
  const [activeTab, setActiveTab] = useState<SurveyTab>('details')
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getPrograms()
      .then(setPrograms)
      .catch(() => setPrograms([]))
  }, [])

  useEffect(() => {
    if (!surveyId) return
    api.getSurvey(Number(surveyId))
      .then((s) => setSurvey({ ...s, pages: s.pages || [] }))
      .catch(() => navigate('/surveys'))
      .finally(() => setLoading(false))
  }, [surveyId, navigate])

  const isActive = survey.status === 'ACTIVE'

  const handleSave = async () => {
    if (!survey.title?.trim()) return
    setSaving(true)
    try {
      if (isEditMode && survey.surveyId) {
        await api.updateSurvey(survey.surveyId, survey)
      } else {
        const created = await api.createSurvey(survey)
        navigate(`/surveys/${created.surveyId}/edit`, { replace: true })
      }
    } catch {
      alert('Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!survey.surveyId || !confirm('Delete this survey?')) return
    try {
      await api.deleteSurvey(survey.surveyId)
      navigate('/surveys')
    } catch {
      alert('Failed to delete survey')
    }
  }

  const handlePublish = async () => {
    if (!survey.surveyId) {
      await handleSave()
      return
    }
    try {
      const updated = await api.publishSurvey(survey.surveyId)
      setSurvey(updated)
    } catch {
      alert('Failed to publish survey')
    }
  }

  const handleNext = () => {
    const currentIdx = SURVEY_TABS.findIndex(t => t.key === activeTab)
    if (currentIdx < SURVEY_TABS.length - 1) {
      setActiveTab(SURVEY_TABS[currentIdx + 1].key)
    }
  }

  const handlePagesChange = (pages: SurveyPage[]) => {
    setSurvey({ ...survey, pages })
  }

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading survey...</p>
  }

  const pageTitle = isEditMode ? (survey.title || 'Edit survey') : 'Create survey'
  const breadcrumbLabel = isEditMode ? (survey.title || 'Edit survey') : 'Create survey'

  return (
    <div className="survey-editor">
      <Breadcrumb items={[
        { label: 'Survey', path: '/surveys' },
        { label: breadcrumbLabel },
      ]} />

      <div className="survey-editor__header">
        <div className="survey-editor__header-left">
          <h1 className="survey-editor__title">{pageTitle}</h1>
          <div className="survey-editor__status-row">
            <span className="survey-editor__status-label">Build status:</span>
            <StatusPill
              label={survey.buildStatus === 'PUBLISHED' ? 'Published' : 'Draft'}
              variant={survey.buildStatus === 'PUBLISHED' ? 'active' : 'draft'}
            />
          </div>
        </div>
        <div className="survey-editor__header-actions">
          {isEditMode && (
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/surveys')}>Cancel</Button>
          <Button variant="secondary" onClick={handlePublish}>Publish</Button>
        </div>
      </div>

      <TabBar
        tabs={SURVEY_TABS}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as SurveyTab)}
      />

      <div className="survey-editor__content">
        {activeTab === 'details' && (
          <>
            <h2 className="survey-editor__section-title">Survey information</h2>

            <div className="survey-editor__form-row">
              <FormField label="Survey Name" required helper="Create a name for the survey." htmlFor="survey-name">
                <Input
                  id="survey-name"
                  placeholder="Add name"
                  value={survey.title || ''}
                  onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                  fullWidth
                />
              </FormField>

              <FormField label="Summary" helper="Add a short description of the survey." htmlFor="survey-summary">
                <Input
                  id="survey-summary"
                  placeholder="Add description"
                  value={survey.description || ''}
                  onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                  fullWidth
                />
              </FormField>

              <FormField label="Survey status">
                <ToggleSwitch
                  label={isActive ? 'Active' : 'Inactive'}
                  checked={isActive}
                  onChange={(checked) => setSurvey({ ...survey, status: checked ? 'ACTIVE' : 'DRAFT' })}
                />
              </FormField>
            </div>

            <div className="survey-editor__form-row survey-editor__form-row--program">
              <FormField label="Program" required helper="Map the survey to a program." htmlFor="survey-program">
                <select
                  id="survey-program"
                  className="program-create__select"
                  value={survey.programId ? String(survey.programId) : ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSurvey({ ...survey, programId: Number(e.target.value) || undefined })}
                >
                  <option value="">Select</option>
                  {programs.map(p => (
                    <option key={p.programId} value={String(p.programId)}>{p.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <hr className="survey-editor__divider" />

            <div className="survey-editor__bottom-actions">
              <Button variant="secondary" onClick={handleSave} loading={saving}>Save</Button>
              <Button variant="primary" onClick={handleNext}>Next</Button>
            </div>
          </>
        )}

        {activeTab === 'formBuilder' && (
          <FormBuilderPanel
            pages={survey.pages || []}
            onPagesChange={handlePagesChange}
            onSave={handleSave}
            onCancel={() => navigate('/surveys')}
            saving={saving}
          />
        )}

        {activeTab === 'formViewer' && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#86868b' }}>
            <p style={{ fontSize: 17 }}>Form Viewer</p>
            <p style={{ fontSize: 14 }}>Preview your survey form here.</p>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#86868b' }}>
            <p style={{ fontSize: 17 }}>Configuration</p>
            <p style={{ fontSize: 14 }}>Survey configuration options coming soon.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#86868b' }}>
            <p style={{ fontSize: 17 }}>Settings</p>
            <p style={{ fontSize: 14 }}>Survey settings coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
