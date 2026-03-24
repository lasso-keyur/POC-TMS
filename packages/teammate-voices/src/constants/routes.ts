export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  PROGRAMS: '/programs',
  PROGRAM_CREATE: '/programs/create',
  SURVEYS: '/surveys',
  SURVEY_CREATE: '/surveys/create',
  SURVEY_EDIT: (id: number | string) => `/surveys/${id}/edit`,
  SURVEY_ANALYTICS: (id: number | string) => `/surveys/${id}/analytics`,
  PARTICIPANTS: '/participants',
  ASSIGNMENT_RULES: '/assignment-rules',
  REPORTS: '/reports',
} as const
