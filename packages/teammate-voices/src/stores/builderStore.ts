import { create } from 'zustand'

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

  setQuestions: (questions: Question[]) => void
  selectQuestion: (id: string | null) => void
  addQuestion: (question: Question) => void
  removeQuestion: (id: string) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  reorderQuestions: (fromIndex: number, toIndex: number) => void
  markClean: () => void
  reset: () => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  questions: [],
  selectedQuestionId: null,
  isDirty: false,

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
    set({ questions: [], selectedQuestionId: null, isDirty: false }),
}))
