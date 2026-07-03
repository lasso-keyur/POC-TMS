// M360 (360-degree feedback) types

export type RaterCategory =
  | 'SELF'
  | 'MANAGER'
  | 'INDIRECT_MANAGER'
  | 'PEERS'
  | 'DIRECT_REPORTS'
  | 'BUSINESS_PARTNERS'

export type CyclePhaseType =
  | 'ENROLLMENT'
  | 'PRE_LAUNCH'
  | 'RATER_SELECTION'
  | 'RATER_APPROVAL'
  | 'RATER_FEEDBACK'
  | 'REPORT_DELIVERY'
  | 'POST_SURVEY'

export const CYCLE_PHASES: { type: CyclePhaseType; label: string }[] = [
  { type: 'ENROLLMENT',      label: 'Enrollment phase' },
  { type: 'PRE_LAUNCH',      label: 'Pre-Launch phase' },
  { type: 'RATER_SELECTION', label: 'Rater Selection phase' },
  { type: 'RATER_APPROVAL',  label: 'Rater Approval phase' },
  { type: 'RATER_FEEDBACK',  label: 'Rater Feedback phase' },
  { type: 'REPORT_DELIVERY', label: 'Report Delivery phase' },
  { type: 'POST_SURVEY',     label: 'Post Survey phase' },
]

export const RATER_CATEGORY_LABELS: Record<RaterCategory, string> = {
  SELF: 'Participant (Self)',
  MANAGER: 'Manager',
  INDIRECT_MANAGER: 'Indirect manager',
  PEERS: 'Peers',
  DIRECT_REPORTS: 'Direct reports',
  BUSINESS_PARTNERS: 'Business partners',
}

export interface PhaseActivity {
  activityId?: number
  activityName: string
  emailTemplateId?: number | null
  emailTemplateName?: string | null
  activityDate?: string | null
  activityTime?: string | null
  isEnabled?: boolean
  sortOrder?: number
}

export interface CyclePhase {
  phaseId?: number
  phaseType: CyclePhaseType
  isEnabled: boolean
  startAt?: string | null
  endAt?: string | null
  timezone?: string
  activities: PhaseActivity[]
}

export interface RaterCriteria {
  criteriaId?: number
  category: RaterCategory
  minCount?: number | null
  maxCount?: number | null
  autoLoad?: boolean
  isEnabled?: boolean
}

export interface M360Cycle {
  cycleId?: number
  programId: number
  surveyId?: number | null
  surveyTitle?: string | null
  name: string
  description?: string | null
  version?: number
  versionLabel?: string
  startDate?: string | null
  status: 'ACTIVE' | 'INACTIVE'
  allowSelfSelection?: boolean
  allowManagerSelection?: boolean
  allowHrSelection?: boolean
  overallMinRaters?: number | null
  overallMaxRaters?: number | null
  participantCount?: number
  scheduleStartAt?: string | null
  scheduleEndAt?: string | null
  phases: CyclePhase[]
  criteria: RaterCriteria[]
  createdAt?: string
  updatedAt?: string
}

export interface M360Enrollment {
  enrollmentId: number
  cycleId: number
  participantId: string
  participantName?: string
  participantEmail?: string
  managerName?: string | null
  managerEmail?: string | null
  status: string
  participantToken?: string
  managerToken?: string
  raterCount: number
}

export interface M360Rater {
  raterAssignmentId: number
  raterParticipantId?: string | null
  raterName: string
  raterEmail: string
  relationship: RaterCategory
  addedBy: 'SELF' | 'MANAGER' | 'HR_PARTNER' | 'SYSTEM'
  addedByName?: string
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'INVITED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED'
  rejectionReason?: string | null
}

export interface M360SelectionView {
  enrollmentId: number
  cycleId: number
  cycleName: string
  mode: 'SELECT' | 'APPROVE'
  participantId: string
  participantName?: string
  participantTitle?: string
  participantOrg?: string
  enrollmentStatus: string
  dueDate?: string | null
  reviewLabel?: string
  windowStartAt?: string | null
  windowEndAt?: string | null
  overallMinRaters?: number | null
  overallMaxRaters?: number | null
  criteria: RaterCriteria[]
  raters: M360Rater[]
}

export interface M360PersonSearchResult {
  participantId: string
  fullName: string
  email: string
  lineOfBusiness?: string | null
  region?: string | null
}

export interface M360Activity {
  activity: string
  surveyName: string
  cycleName: string
  participantName: string
  myRole: string
  dueDate?: string | null
  status: string
  linkPath: string
  completed: boolean
}

export interface M360CategoryScore {
  category: RaterCategory
  avgScore: number
  responseCount: number
}

export interface M360ReportQuestionRow {
  questionId: number
  questionText?: string
  category: RaterCategory
  avgScore: number
  responseCount: number
}

export interface M360Report {
  cycleId: number
  cycleName: string
  participantId: string
  participantName?: string
  categoryScores: M360CategoryScore[]
  questionRows: M360ReportQuestionRow[]
}
