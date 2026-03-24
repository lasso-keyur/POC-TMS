import type { QuestionInfo } from './types'
import type { LogicRule } from '@/types/logic'
import RuleCard from './RuleCard'

interface AllRulesTabProps {
  questions: QuestionInfo[]
  logicRules: LogicRule[]
  onEditRule: (rule: LogicRule) => void
  onDeleteRule: (ruleId: string) => void
}

export default function AllRulesTab({ questions, logicRules, onEditRule, onDeleteRule }: AllRulesTabProps) {
  if (logicRules.length === 0) {
    return (
      <div className="cfg-all-rules__empty">
        <p>No logic rules configured for this survey.</p>
      </div>
    )
  }

  return (
    <div className="cfg-all-rules">
      <p className="cfg-all-rules__count">
        {logicRules.length} rule{logicRules.length !== 1 ? 's' : ''} total
      </p>
      <div className="cfg-all-rules__list">
        {logicRules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            questions={questions}
            onEdit={() => onEditRule(rule)}
            onDelete={() => onDeleteRule(rule.id)}
          />
        ))}
      </div>
    </div>
  )
}
