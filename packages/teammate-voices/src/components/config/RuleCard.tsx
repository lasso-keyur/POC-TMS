import type { LogicRule } from '@/types/logic'
import { RULE_TYPE_LABELS, ACTION_TYPE_LABELS, OPERATOR_LABELS } from '@/types/logic'
import type { QuestionInfo } from './types'

interface RuleCardProps {
  rule: LogicRule
  questions: QuestionInfo[]
  onEdit: () => void
  onDelete: () => void
}

function qLabel(id: string, questions: QuestionInfo[]): string {
  return questions.find(q => q.id === id)?.label ?? `Q(${id})`
}

function buildSentence(rule: LogicRule, questions: QuestionInfo[]): { ifPart: string; thenPart: string } {
  const conds = rule.conditions.items.map((c, i) => {
    const ql = qLabel(c.questionId, questions)
    const ol = OPERATOR_LABELS[c.operator] || c.operator
    const vl = c.operator === 'is_empty' || c.operator === 'is_not_empty'
      ? '' : ` "${Array.isArray(c.value) ? c.value.join(', ') : c.value}"`
    const prefix = i > 0 ? ` ${rule.conditions.operator} ` : ''
    return `${prefix}${ql} ${ol}${vl}`
  })

  const actionLabel = ACTION_TYPE_LABELS[rule.action.type] || rule.action.type
  let target = ''
  if (rule.action.targetQuestionId) target = qLabel(rule.action.targetQuestionId, questions)
  else if (rule.action.targetPageId) target = `Page ${rule.action.targetPageId}`
  else if (rule.action.pipeField) target = rule.action.pipeField

  return {
    ifPart: conds.join('') || 'no conditions',
    thenPart: `${actionLabel} ${target}`.trim(),
  }
}

export default function RuleCard({ rule, questions, onEdit, onDelete }: RuleCardProps) {
  const { ifPart, thenPart } = buildSentence(rule, questions)

  return (
    <div className="cfg-rule-card">
      <div className="cfg-rule-card__badge">{RULE_TYPE_LABELS[rule.type]}</div>
      <div className="cfg-rule-card__sentence">
        <span className="cfg-rule-card__keyword">IF</span> {ifPart}
        <br />
        <span className="cfg-rule-card__keyword cfg-rule-card__keyword--then">THEN</span> {thenPart}
      </div>
      <div className="cfg-rule-card__actions">
        <button className="cfg-rule-card__btn" onClick={onEdit}>Edit</button>
        <button className="cfg-rule-card__btn cfg-rule-card__btn--delete" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
