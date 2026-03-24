import { create } from 'zustand'
import type { LogicRule } from '@/types/logic'

export interface QuestionOption {
  id: string
  label: string
  value: string
}

export interface Question {
  id: string
  type: string
  title: string
  description?: string
  required: boolean
  options?: QuestionOption[]
  order: number
}

interface BuilderState {
  questions: Question[]
  selectedQuestionId: string | null
  isDirty: boolean
  logicRules: LogicRule[]
  selectedRuleId: string | null

  setQuestions: (questions: Question[]) => void
  selectQuestion: (id: string | null) => void
  addQuestion: (question: Question) => void
  removeQuestion: (id: string) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  reorderQuestions: (fromIndex: number, toIndex: number) => void
  markClean: () => void
  reset: () => void

  setLogicRules: (rules: LogicRule[]) => void
  addLogicRule: (rule: LogicRule) => void
  updateLogicRule: (ruleId: string, rule: LogicRule) => void
  removeLogicRule: (ruleId: string) => void
  selectRule: (ruleId: string | null) => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  questions: [],
  selectedQuestionId: null,
  isDirty: false,
  logicRules: [],
  selectedRuleId: null,

  setQuestions: (questions) => set({ questions, isDirty: false }),

  selectQuestion: (id) => set({ selectedQuestionId: id }),

  addQuestion: (question) =>
    set((state) => ({
      questions: [...state.questions, { ...question, order: state.questions.length }],
      selectedQuestionId: question.id,
      isDirty: true,
    })),

  removeQuestion: (id) =>
    set((state) => {
      const filtered = state.questions
        .filter((q) => q.id !== id)
        .map((q, index) => ({ ...q, order: index }))
      return {
        questions: filtered,
        selectedQuestionId:
          state.selectedQuestionId === id ? null : state.selectedQuestionId,
        isDirty: true,
      }
    }),

  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
      isDirty: true,
    })),

  reorderQuestions: (fromIndex, toIndex) =>
    set((state) => {
      const updated = [...state.questions]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return {
        questions: updated.map((q, index) => ({ ...q, order: index })),
        isDirty: true,
      }
    }),

  markClean: () => set({ isDirty: false }),

  reset: () =>
    set({ questions: [], selectedQuestionId: null, isDirty: false, logicRules: [], selectedRuleId: null }),

  setLogicRules: (logicRules) => set({ logicRules }),

  addLogicRule: (rule) =>
    set((state) => ({
      logicRules: [...state.logicRules, rule],
      selectedRuleId: rule.id,
      isDirty: true,
    })),

  updateLogicRule: (ruleId, rule) =>
    set((state) => ({
      logicRules: state.logicRules.map((r) => (r.id === ruleId ? rule : r)),
      isDirty: true,
    })),

  removeLogicRule: (ruleId) =>
    set((state) => ({
      logicRules: state.logicRules.filter((r) => r.id !== ruleId),
      selectedRuleId: state.selectedRuleId === ruleId ? null : state.selectedRuleId,
      isDirty: true,
    })),

  selectRule: (ruleId) => set({ selectedRuleId: ruleId }),
}))
