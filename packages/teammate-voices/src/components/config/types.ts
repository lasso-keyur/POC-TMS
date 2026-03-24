import type { SurveyPage, SurveyQuestion } from '@/types/survey'
import type { LogicRule } from '@/types/logic'

/** Flattened question info used across the config flow components */
export interface QuestionInfo {
  id: string
  label: string
  text: string
  type: string
  options: string[]
  pageId: string
  pageLabel: string
  pageIdx: number
  questionIdx: number
}

/** Build a flat list of QuestionInfo from pages */
export function buildQuestionList(pages: SurveyPage[]): QuestionInfo[] {
  return pages.flatMap((page, pageIdx) =>
    page.questions.map((q: SurveyQuestion, qIdx: number) => ({
      id: q.questionId?.toString() || `${page.pageId}-q${qIdx}`,
      label: `P${pageIdx + 1} Q${qIdx + 1}: ${q.questionText || 'Untitled'}`,
      text: q.questionText || 'Untitled',
      type: q.questionType,
      options: (q.options || []).map(o => o.optionText),
      pageId: page.pageId,
      pageLabel: page.title || `Page ${pageIdx + 1}`,
      pageIdx,
      questionIdx: qIdx,
    }))
  )
}

/** Count how many rules reference a given question ID (as source or target) */
export function getRuleCountForQuestion(questionId: string, rules: LogicRule[]): number {
  return rules.filter(rule =>
    rule.conditions.items.some(c => c.questionId === questionId) ||
    rule.action.targetQuestionId === questionId
  ).length
}

/** Get rules where questionId appears as a condition source */
export function getRulesSourcedFrom(questionId: string, rules: LogicRule[]): LogicRule[] {
  return rules.filter(rule =>
    rule.conditions.items.some(c => c.questionId === questionId)
  )
}

/** Get rules where questionId is the action target */
export function getRulesTargeting(questionId: string, rules: LogicRule[]): LogicRule[] {
  return rules.filter(rule => rule.action.targetQuestionId === questionId)
}

export function generateRuleId(): string {
  return 'lr_' + Math.random().toString(36).substring(2, 11)
}

export function createEmptyRule(sourceQuestionId?: string): LogicRule {
  return {
    id: generateRuleId(),
    type: 'visible_if',
    conditions: {
      operator: 'AND',
      items: sourceQuestionId
        ? [{ questionId: sourceQuestionId, operator: 'equals', value: '' }]
        : [],
    },
    action: { type: 'show' },
  }
}
