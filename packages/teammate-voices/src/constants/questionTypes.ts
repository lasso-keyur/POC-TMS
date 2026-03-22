export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RATING = 'RATING',
  LIKERT = 'LIKERT',
  NPS = 'NPS',
  RANKING = 'RANKING',
}

export interface QuestionTypeDefinition {
  type: QuestionType
  label: string
  description: string
  hasOptions: boolean
  icon: string
}

export const QUESTION_TYPES: QuestionTypeDefinition[] = [
  {
    type: QuestionType.TEXT,
    label: 'Short Text',
    description: 'Single-line text response',
    hasOptions: false,
    icon: 'type',
  },
  {
    type: QuestionType.TEXTAREA,
    label: 'Long Text',
    description: 'Multi-line text response',
    hasOptions: false,
    icon: 'align-left',
  },
  {
    type: QuestionType.SINGLE_CHOICE,
    label: 'Single Choice',
    description: 'Select one option from a list',
    hasOptions: true,
    icon: 'circle-dot',
  },
  {
    type: QuestionType.MULTIPLE_CHOICE,
    label: 'Multiple Choice',
    description: 'Select multiple options from a list',
    hasOptions: true,
    icon: 'check-square',
  },
  {
    type: QuestionType.RATING,
    label: 'Rating',
    description: 'Star or numeric rating scale',
    hasOptions: false,
    icon: 'star',
  },
  {
    type: QuestionType.LIKERT,
    label: 'Likert Scale',
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)',
    hasOptions: false,
    icon: 'sliders',
  },
  {
    type: QuestionType.NPS,
    label: 'Net Promoter Score',
    description: 'How likely to recommend (0-10)',
    hasOptions: false,
    icon: 'gauge',
  },
  {
    type: QuestionType.RANKING,
    label: 'Ranking',
    description: 'Rank items in order of preference',
    hasOptions: true,
    icon: 'list-ordered',
  },
]
