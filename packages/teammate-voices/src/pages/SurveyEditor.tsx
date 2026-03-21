import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button, Input } from '@teammate-voices/design-system'
import { api } from '@/services/api'
import type { Survey, SurveyQuestion } from '@/types/survey'

export default function SurveyEditor() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!surveyId) return
    api.getSurvey(Number(surveyId))
      .then(setSurvey)
      .catch(() => navigate('/surveys'))
      .finally(() => setLoading(false))
  }, [surveyId, navigate])

  const handleSave = async () => {
    if (!survey) return
    setSaving(true)
    try {
      await api.updateSurvey(survey.surveyId, survey)
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!survey) return
    try {
      const updated = await api.publishSurvey(survey.surveyId)
      setSurvey(updated)
    } catch {
      alert('Failed to publish')
    }
  }

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: string | boolean) => {
    if (!survey?.questions) return
    const updated = [...survey.questions]
    updated[index] = { ...updated[index], [field]: value }
    setSurvey({ ...survey, questions: updated })
  }

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 60, color: '#86868B' }}>Loading survey...</p>
  }

  if (!survey) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1D1D1F', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {survey.title}
          </h1>
          <p style={{ fontSize: 14, color: '#86868B', margin: 0 }}>
            {survey.templateType.replace(/_/g, ' ')} &middot; {survey.status}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => navigate('/surveys')}>Back</Button>
          <Button variant="secondary" onClick={handleSave} loading={saving}>Save</Button>
          {survey.status === 'DRAFT' && (
            <Button variant="primary" onClick={handlePublish}>Publish</Button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Input
          label="Title"
          id="editor-title"
          value={survey.title}
          onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          fullWidth
        />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1D1D1F', margin: '0 0 16px' }}>
        Questions ({survey.questions?.length || 0})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {survey.questions?.map((q, i) => (
          <Card key={q.questionId} variant="elevated" padding="none">
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#86868B' }}>Q{i + 1} &middot; {q.questionType.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: 12, color: q.isRequired ? '#FF3B30' : '#86868B' }}>
                {q.isRequired ? 'Required' : 'Optional'}
              </span>
            </CardHeader>
            <CardBody style={{ padding: '0 20px 16px' }}>
              <Input
                id={`q-${q.questionId}`}
                value={q.questionText}
                onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                fullWidth
                size="sm"
              />
              {q.options && q.options.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {q.options.map(opt => (
                    <div key={opt.optionId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #D2D2D7', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#1D1D1F' }}>{opt.optionText}</span>
                      <span style={{ fontSize: 12, color: '#86868B', marginLeft: 'auto' }}>({opt.optionValue})</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
