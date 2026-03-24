import type { QuestionInfo } from './types'
import { getRulesSourcedFrom, getRulesTargeting, getRuleCountForQuestion } from './types'
import type { LogicRule } from '@/types/logic'
import FocusedQuestionCard from './FocusedQuestionCard'
import BranchPath from './BranchPath'

interface FocusedFlowPanelProps {
  focusedQuestion: QuestionInfo | null
  questions: QuestionInfo[]
  logicRules: LogicRule[]
  onFocusQuestion: (id: string) => void
  onOpenRules: (questionId: string) => void
}

export default function FocusedFlowPanel({
  focusedQuestion, questions, logicRules, onFocusQuestion, onOpenRules,
}: FocusedFlowPanelProps) {
  if (!focusedQuestion) {
    return (
      <div className="cfg-flow">
        <div className="cfg-flow__empty">
          <p className="cfg-flow__empty-text">Select a question from the sidebar to view its logic flow</p>
        </div>
      </div>
    )
  }

  const sourcedRules = getRulesSourcedFrom(focusedQuestion.id, logicRules)
  const targetRules = getRulesTargeting(focusedQuestion.id, logicRules)
  const ruleCount = getRuleCountForQuestion(focusedQuestion.id, logicRules)

  return (
    <div className="cfg-flow">
      <div className="cfg-flow__header">
        <span className="cfg-flow__always">Always visible</span>
      </div>

      <div className="cfg-flow__focused">
        <FocusedQuestionCard
          question={focusedQuestion}
          ruleCount={ruleCount}
          onOpenRules={() => onOpenRules(focusedQuestion.id)}
        />
      </div>

      {sourcedRules.length > 0 && (
        <div className="cfg-flow__branches">
          <div className="cfg-flow__connector-root">
            <span className="cfg-flow__dot" />
            <span className="cfg-flow__line" />
          </div>
          <div className="cfg-flow__branch-list">
            {sourcedRules.map(rule => (
              <BranchPath
                key={rule.id}
                rule={rule}
                questions={questions}
                onFocusQuestion={onFocusQuestion}
                onOpenRules={onOpenRules}
              />
            ))}
          </div>
        </div>
      )}

      {sourcedRules.length === 0 && targetRules.length === 0 && (
        <div className="cfg-flow__no-rules">
          <p>No logic rules for this question.</p>
          <button className="cfg-flow__add-btn" onClick={() => onOpenRules(focusedQuestion.id)}>
            + Add a rule
          </button>
        </div>
      )}

      {targetRules.length > 0 && (
        <div className="cfg-flow__incoming">
          <h5 className="cfg-flow__section-title">Incoming rules (targeting this question)</h5>
          <div className="cfg-flow__incoming-list">
            {targetRules.map(rule => {
              const sourceQ = questions.find(q =>
                rule.conditions.items.some(c => c.questionId === q.id)
              )
              return (
                <button
                  key={rule.id}
                  className="cfg-flow__incoming-item"
                  onClick={() => sourceQ && onFocusQuestion(sourceQ.id)}
                >
                  {sourceQ ? `From Q${sourceQ.questionIdx + 1}: ${sourceQ.text}` : 'Unknown source'}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
