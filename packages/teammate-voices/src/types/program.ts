export type ProgramStatus = 'Active' | 'Inactive' | 'ACTIVE' | 'INACTIVE'
export type SurveyProgress = 'Not started' | 'In progress' | 'Complete' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'

export interface Program {
  programId: number
  name: string
  description: string
  templateType?: string
  status: ProgramStatus
  surveyProgress: SurveyProgress
  createdAt: string
  updatedAt: string
}

export const PROGRAM_TEMPLATES = [
  'Teammate Voices',
  'Intern Program',
  'Engagement Survey',
  'NPS Survey',
  'Custom',
] as const
