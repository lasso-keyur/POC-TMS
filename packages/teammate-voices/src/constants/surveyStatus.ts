export enum SurveyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  [SurveyStatus.DRAFT]: 'Draft',
  [SurveyStatus.ACTIVE]: 'Active',
  [SurveyStatus.PAUSED]: 'Paused',
  [SurveyStatus.CLOSED]: 'Closed',
  [SurveyStatus.ARCHIVED]: 'Archived',
}

export const SURVEY_STATUS_COLORS: Record<SurveyStatus, string> = {
  [SurveyStatus.DRAFT]: 'gray',
  [SurveyStatus.ACTIVE]: 'green',
  [SurveyStatus.PAUSED]: 'yellow',
  [SurveyStatus.CLOSED]: 'red',
  [SurveyStatus.ARCHIVED]: 'slate',
}
