import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@teammate-voices/design-system'
import Breadcrumb from '@/components/Breadcrumb'
import DataTable from '@/components/DataTable'
import StatusPill from '@/components/StatusPill'
import type { Column } from '@/components/DataTable'
import { api } from '@/services/api'
import type { Survey } from '@/types/survey'
import type { Program } from '@/types/program'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return dateStr.substring(0, 10)
}

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.getSurveys(), api.getPrograms()])
      .then(([s, p]) => { setSurveys(s); setPrograms(p) })
      .catch(() => { setSurveys([]); setPrograms([]) })
      .finally(() => setLoading(false))
  }, [])

  const getProgramName = (survey: Survey): string => {
    if (!survey.programId) return ''
    const program = programs.find(p => p.programId === survey.programId)
    return program?.name ?? ''
  }

  const columns: Column<Survey>[] = [
    {
      key: 'program',
      label: 'Program',
      render: (row) => getProgramName(row),
    },
    {
      key: 'title',
      label: 'Survey name',
      render: (row) => (
        <Link to={`/surveys/${row.surveyId}/edit`} className="dt__link">
          {row.title}
        </Link>
      ),
    },
    {
      key: 'description',
      label: 'Summary',
      render: (row) => row.description || '',
    },
    {
      key: 'cycle',
      label: 'Cycle',
      render: (row) => row.cycle || '',
    },
    {
      key: 'status',
      label: 'Active',
      render: (row) => (row.status === 'ACTIVE' ? 'Active' : 'Inactive'),
    },
    {
      key: 'buildStatus',
      label: 'Build status',
      render: (row) => (
        <StatusPill
          label={row.buildStatus === 'PUBLISHED' ? 'Published' : 'Draft'}
          variant={row.buildStatus === 'PUBLISHED' ? 'active' : 'draft'}
        />
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: 'createdAt',
      label: 'Date created',
      render: (row) => formatDate(row.createdAt),
    },
  ]

  return (
    <div className="survey-library">
      <Breadcrumb items={[
        { label: 'Surveys', path: '/surveys' },
        { label: 'Survey Library' },
      ]} />

      <h1 className="survey-library__title">Survey library</h1>

      <div className="survey-library__table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px' }}>
          <h2 className="survey-library__section-title">Surveys</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/surveys/new')}>
            Create survey
          </Button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 60, color: '#86868b' }}>Loading surveys...</p>
        ) : (
          <DataTable
            columns={columns}
            data={surveys}
            emptyMessage="No surveys available"
            rowKey={(row) => row.surveyId}
            onRowAction={(row) => navigate(`/surveys/${row.surveyId}/edit`)}
          />
        )}
      </div>
    </div>
  )
}
