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

export interface ParticipantStatusRow {
  participantId: string
  fullName: string
  email: string
  cohort: string | null
  participantType: string
  active: boolean
  dispatchStatus: string | null
  surveyStage: string | null
  sentAt: string | null
  submittedAt: string | null
  reminderCount: number
}

export interface ProgramDetail {
  program: Program
  participants: ParticipantStatusRow[]
  totalParticipants: number
  completedCount: number
  pendingCount: number
  sentCount: number
}

export const PROGRAM_TEMPLATES = [
  'Teammate Voices',
  'Intern Program',
  'Engagement Survey',
  'NPS Survey',
  'Custom',
] as const
