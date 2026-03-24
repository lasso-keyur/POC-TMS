import type { QuestionInfo } from './types'
import type { LogicRule } from '@/types/logic'
import { ACTION_TYPE_LABELS, OPERATOR_LABELS } from '@/types/logic'
import TargetQuestionCard from './TargetQuestionCard'

interface BranchPathProps {
  rule: LogicRule
  questions: QuestionInfo[]
  onFocusQuestion: (id: string) => void
  onOpenRules: (questionId: string) => void
}

function getBranchLabel(rule: LogicRule, questions: QuestionInfo[]): { text: string; variant: 'yes' | 'no' | 'compound' } {
  const items = rule.conditions.items
  if (items.length === 1) {
    const c = items[0]
    const opLabel = OPERATOR_LABELS[c.operator] || c.operator
    const valStr = c.operator === 'is_empty' || c.operator === 'is_not_empty'
      ? ''
      : ` "${Array.isArray(c.value) ? c.value.join(', ') : c.value}"`
    const text = `${opLabel}${valStr}`
    const isPositive = !c.operator.startsWith('not_') && c.operator !== 'is_empty'
    return { text, variant: isPositive ? 'yes' : 'no' }
  }
  const parts = items.map(c => {
    const q = questions.find(q => q.id === c.questionId)
    const qLabel = q ? `Q${q.questionIdx + 1}` : c.questionId
    const opLabel = OPERATOR_LABELS[c.operator] || c.operator
    return `${qLabel} ${opLabel}`
  })
  return { text: parts.join(` ${rule.conditions.operator} `), variant: 'compound' }
}

export default function BranchPath({ rule, questions, onFocusQuestion, onOpenRules }: BranchPathProps) {
  const { text, variant } = getBranchLabel(rule, questions)
  const actionLabel = ACTION_TYPE_LABELS[rule.action.type] || rule.action.type
  const targetQuestion = rule.action.targetQuestionId
    ? questions.find(q => q.id === rule.action.targetQuestionId)
    : null
  const targetPageLabel = rule.action.targetPageId
    ? `Page ${rule.action.targetPageId}` : undefined

  return (
    <div className="cfg-branch">
      <div className="cfg-branch__connector">
        <span className="cfg-branch__dot" />
        <span className="cfg-branch__line" />
      </div>
      <span className={`cfg-branch__label cfg-branch__label--${variant}`}>{text}</span>
      <div className="cfg-branch__connector">
        <span className="cfg-branch__line cfg-branch__line--short" />
        <span className="cfg-branch__dot" />
      </div>
      <TargetQuestionCard
        question={targetQuestion || null}
        pageLabel={targetPageLabel}
        actionLabel={actionLabel}
        onClick={() => {
          if (targetQuestion) onFocusQuestion(targetQuestion.id)
        }}
        onOpenRules={targetQuestion ? () => onOpenRules(targetQuestion.id) : undefined}
      />
    </div>
  )
}
