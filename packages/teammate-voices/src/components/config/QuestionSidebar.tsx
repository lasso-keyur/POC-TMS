import type { QuestionInfo } from './types'
import { getRuleCountForQuestion } from './types'
import type { LogicRule } from '@/types/logic'

interface QuestionSidebarProps {
  questions: QuestionInfo[]
  logicRules: LogicRule[]
  focusedQuestionId: string | null
  onSelectQuestion: (id: string) => void
}

export default function QuestionSidebar({
  questions, logicRules, focusedQuestionId, onSelectQuestion,
}: QuestionSidebarProps) {
  return (
    <div className="cfg-sidebar">
      <h4 className="cfg-sidebar__title">Questions</h4>
      <div className="cfg-sidebar__list">
        {questions.map(q => {
          const count = getRuleCountForQuestion(q.id, logicRules)
          const isActive = q.id === focusedQuestionId
          return (
            <button
              key={q.id}
              className={`cfg-sidebar__item${isActive ? ' cfg-sidebar__item--active' : ''}`}
              onClick={() => onSelectQuestion(q.id)}
            >
              <span className="cfg-sidebar__num">Q{q.questionIdx + 1}</span>
              <span className="cfg-sidebar__text">{q.text}</span>
              {count > 0 && <span className="cfg-sidebar__badge">{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
