import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button } from '@arya/design-system'
import { api } from '@/services/api'
import type { Survey } from '@/types/survey'

export default function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'ACTIVE').length,
    draft: surveys.filter(s => s.status === 'DRAFT').length,
    closed: surveys.filter(s => s.status === 'CLOSED').length,
  }

  const statCards = [
    { label: 'Total Surveys', value: stats.total, color: '#007AFF' },
    { label: 'Active', value: stats.active, color: '#34C759' },
    { label: 'Drafts', value: stats.draft, color: '#FF9500' },
    { label: 'Closed', value: stats.closed, color: '#FF3B30' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1D1D1F', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 17, color: '#86868B', margin: 0 }}>
          Teammate Voices survey management overview
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#86868B', textAlign: 'center', padding: 40 }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {statCards.map(stat => (
              <Card key={stat.label} variant="elevated" padding="md">
                <CardBody>
                  <p style={{ fontSize: 13, color: '#86868B', margin: '0 0 4px', fontWeight: 500 }}>{stat.label}</p>
                  <p style={{ fontSize: 34, fontWeight: 700, color: stat.color, margin: 0, letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>Recent Surveys</h2>
            <Link to="/surveys" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">View All</Button>
            </Link>
          </div>

          {surveys.length === 0 ? (
            <Card variant="elevated" padding="lg">
              <CardBody style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontSize: 17, color: '#86868B', margin: '0 0 16px' }}>No surveys yet</p>
                <Link to="/surveys/new" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Create Your First Survey</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {surveys.slice(0, 6).map(survey => (
                <Link key={survey.surveyId} to={`/surveys/${survey.surveyId}/edit`} style={{ textDecoration: 'none' }}>
                  <Card variant="elevated" hoverable padding="md">
                    <CardBody>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                          backgroundColor: survey.status === 'ACTIVE' ? '#D1FAE5' : '#F2F2F7',
                          color: survey.status === 'ACTIVE' ? '#065F46' : '#8E8E93',
                        }}>
                          {survey.status}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1D1D1F', margin: '0 0 4px' }}>{survey.title}</h3>
                      <p style={{ fontSize: 14, color: '#86868B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {survey.description || 'No description'}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
