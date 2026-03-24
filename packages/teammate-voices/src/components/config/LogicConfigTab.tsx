import { useState, useMemo } from 'react'
import type { SurveyPage } from '@/types/survey'
import type { LogicRule } from '@/types/logic'
import { buildQuestionList, getRulesSourcedFrom, getRulesTargeting } from './types'
import QuestionSidebar from './QuestionSidebar'
import FocusedFlowPanel from './FocusedFlowPanel'
import AllRulesTab from './AllRulesTab'
import LogicRulesPopup from './LogicRulesPopup'

interface LogicConfigTabProps {
  pages: SurveyPage[]
  logicRules: LogicRule[]
  onRulesChange: (rules: LogicRule[]) => void
}

type SubTab = 'flow' | 'allRules'

export default function LogicConfigTab({ pages, logicRules, onRulesChange }: LogicConfigTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('flow')
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null)
  const [popupQuestionId, setPopupQuestionId] = useState<string | null>(null)

  const questions = useMemo(() => buildQuestionList(pages), [pages])

  const focusedQuestion = questions.find(q => q.id === focusedQuestionId) || null
  const popupQuestion = questions.find(q => q.id === popupQuestionId) || null

  const pagesMeta = useMemo(() =>
    pages.map((p, i) => ({ id: p.pageId, label: p.title || `Page ${i + 1}` })),
    [pages]
  )

  // Auto-select first question if none selected
  if (!focusedQuestionId && questions.length > 0) {
    // Use a microtask so we don't setState during render
    queueMicrotask(() => setFocusedQuestionId(questions[0].id))
  }

  const handleSaveRule = (rule: LogicRule) => {
    const exists = logicRules.some(r => r.id === rule.id)
    const updated = exists
      ? logicRules.map(r => r.id === rule.id ? rule : r)
      : [...logicRules, rule]
    onRulesChange(updated)
  }

  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(logicRules.filter(r => r.id !== ruleId))
  }

  const handleOpenRules = (questionId: string) => {
    setPopupQuestionId(questionId)
  }

  const handleEditRuleFromAllTab = (rule: LogicRule) => {
    // Find the source question and open the popup focused on it
    const sourceQId = rule.conditions.items[0]?.questionId
    if (sourceQId) {
      setPopupQuestionId(sourceQId)
    }
  }

  return (
    <div className="cfg-tab">
      <div className="cfg-tab__header">
        <div className="cfg-tab__subtabs">
          <button
            className={`cfg-tab__subtab${subTab === 'flow' ? ' cfg-tab__subtab--active' : ''}`}
            onClick={() => setSubTab('flow')}
          >
            Focused Flow
          </button>
          <button
            className={`cfg-tab__subtab${subTab === 'allRules' ? ' cfg-tab__subtab--active' : ''}`}
            onClick={() => setSubTab('allRules')}
          >
            All Rules ({logicRules.length})
          </button>
        </div>
      </div>

      {subTab === 'flow' ? (
        <div className="cfg-tab__flow-layout">
          <QuestionSidebar
            questions={questions}
            logicRules={logicRules}
            focusedQuestionId={focusedQuestionId}
            onSelectQuestion={setFocusedQuestionId}
          />
          <FocusedFlowPanel
            focusedQuestion={focusedQuestion}
            questions={questions}
            logicRules={logicRules}
            onFocusQuestion={setFocusedQuestionId}
            onOpenRules={handleOpenRules}
          />
        </div>
      ) : (
        <AllRulesTab
          questions={questions}
          logicRules={logicRules}
          onEditRule={handleEditRuleFromAllTab}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {popupQuestion && (
        <LogicRulesPopup
          open={!!popupQuestion}
          onClose={() => setPopupQuestionId(null)}
          question={popupQuestion}
          rules={getRulesSourcedFrom(popupQuestion.id, logicRules)}
          targetRules={getRulesTargeting(popupQuestion.id, logicRules)}
          allQuestions={questions}
          pages={pagesMeta}
          onSaveRule={handleSaveRule}
          onDeleteRule={handleDeleteRule}
        />
      )}
    </div>
  )
}
