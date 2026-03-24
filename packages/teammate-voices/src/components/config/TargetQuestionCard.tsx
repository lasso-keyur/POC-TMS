import type { QuestionInfo } from './types'

interface TargetQuestionCardProps {
  question: QuestionInfo | null
  pageLabel?: string
  actionLabel: string
  onClick: () => void
  onOpenRules?: () => void
}

export default function TargetQuestionCard({
  question, pageLabel, actionLabel, onClick, onOpenRules,
}: TargetQuestionCardProps) {
  const label = question
    ? `Q${question.questionIdx + 1}: ${question.text}`
    : pageLabel || 'Unknown target'

  return (
    <div className="cfg-target-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="cfg-target-card__header">
        <span className="cfg-target-card__action">{actionLabel}</span>
        {onOpenRules && (
          <button
            className="cfg-target-card__gear"
            onClick={(e) => { e.stopPropagation(); onOpenRules() }}
            title="Edit rules"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
      </div>
      <p className="cfg-target-card__label">{label}</p>
    </div>
  )
}
