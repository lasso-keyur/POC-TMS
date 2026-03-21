import { Card, CardHeader, CardBody, CardFooter, Button } from '@arya/design-system'
import StatusBadge from './StatusBadge'
import type { Survey } from '@/types/survey'

interface SurveyCardProps {
  survey: Survey
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export default function SurveyCard({ survey, onEdit, onDelete }: SurveyCardProps) {
  const formattedDate = survey.updatedAt
    ? new Date(survey.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '\u2014'

  return (
    <Card variant="elevated" hoverable pressable padding="none" onClick={() => onEdit(survey.surveyId)}>
      <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px' }}>
        <StatusBadge status={survey.status} />
        <span style={{ fontSize: 12, color: '#8E8E93' }}>{formattedDate}</span>
      </CardHeader>
      <CardBody style={{ padding: '0 20px 8px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, color: '#1D1D1F' }}>
          {survey.title}
        </h3>
        {survey.description && (
          <p style={{ margin: 0, fontSize: 14, color: '#86868B', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {survey.description}
          </p>
        )}
      </CardBody>
      <CardFooter style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, backgroundColor: '#F2F2F7', color: '#636366' }}>
            {survey.templateType.replace(/_/g, ' ')}
          </span>
          {survey.surveyStage && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
              {survey.surveyStage.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDelete(survey.surveyId) }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
