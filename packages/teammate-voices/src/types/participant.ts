export interface Participant {
  participantId: string
  fullName: string
  email: string
  participantType: 'NEW_HIRE' | 'EXISTING_RESOURCE'
  trainingProgram?: string
  cohort?: string
  region?: string
  lineOfBusiness?: string
  startDate: string
  expectedEndDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssignmentRule {
  ruleId: number
  ruleName: string
  participantType: 'NEW_HIRE' | 'EXISTING_RESOURCE' | 'ALL'
  surveyStage: 'ONBOARDING' | 'MID_TRAINING' | 'END_TRAINING'
  surveyId: number
  sendDayOffset?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Dispatch {
  dispatchId: number
  participantId: string
  surveyId: number
  surveyStage: 'ONBOARDING' | 'MID_TRAINING' | 'END_TRAINING'
  dispatchStatus: 'PENDING' | 'SENT' | 'OPENED' | 'SUBMITTED' | 'FAILED' | 'EXPIRED'
  sentAt: string | null
  openedAt: string | null
  submittedAt: string | null
  reminderCount: number
  dispatchToken: string | null
  createdAt: string
  updatedAt: string
}
