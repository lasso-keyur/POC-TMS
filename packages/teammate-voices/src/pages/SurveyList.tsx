import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@arya/design-system'
import SurveyCard from '@/components/SurveyCard'
import { api } from '@/services/api'
import type { Survey } from '@/types/survey'

type TabKey = 'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'CLOSED', label: 'Closed' },
]

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = surveys.filter(s => {
    const matchesTab = activeTab === 'all' || s.status === activeTab
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const getCount = (tab: TabKey) =>
    tab === 'all' ? surveys.length : surveys.filter(s => s.status === tab).length

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this survey?')) return
    try {
      await api.deleteSurvey(id)
      setSurveys(prev => prev.filter(s => s.surveyId !== id))
    } catch {
      alert('Failed to delete survey')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>
          Surveys
        </h1>
        <Button variant="primary" onClick={() => navigate('/surveys/new')}>
          Create Survey
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: activeTab === tab.key ? '#007AFF' : '#F2F2F7',
                color: activeTab === tab.key ? '#fff' : '#636366',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label} <span style={{ opacity: 0.7 }}>({getCount(tab.key)})</span>
            </button>
          ))}
        </div>

        <div style={{ width: 280 }}>
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            fullWidth
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: 60, color: '#86868B', fontSize: 17 }}>Loading surveys...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 17, color: '#86868B', marginBottom: 16 }}>
            {search ? 'No surveys match your search' : 'No surveys yet'}
          </p>
          {!search && (
            <Button variant="primary" onClick={() => navigate('/surveys/new')}>
              Create Your First Survey
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(survey => (
            <SurveyCard
              key={survey.surveyId}
              survey={survey}
              onEdit={(id) => navigate(`/surveys/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
