export interface ChartDataPoint {
  label: string
  value: number
  color: string
}

export interface StatusCount {
  label: string
  value: number
  color: string
}

export type ActionStatus = 'Complete' | 'In progress' | 'Not started'

export interface ActionItem {
  employeeName: string
  program: string
  task: string
  relationship: string
  dueDate: string
  status: ActionStatus
}

export const MOCK_REPORTS_PENDING: ChartDataPoint[] = [
  { label: 'Self', value: 8, color: '#012169' },
  { label: 'Direct reports', value: 6, color: '#4472C4' },
  { label: 'Others', value: 2, color: '#B4C7E7' },
]

export const MOCK_REPORTS_COMPLETE: ChartDataPoint[] = [
  { label: 'Self', value: 3, color: '#C00000' },
  { label: 'Direct reports', value: 7, color: '#FF0000' },
  { label: 'Others', value: 5, color: '#FFB6B6' },
]

export const MOCK_STATUS: StatusCount[] = [
  { label: 'In progress', value: 2, color: '#007AFF' },
  { label: 'Not started', value: 4, color: '#FF3B30' },
  { label: 'Complete', value: 4, color: '#A6A6A6' },
]

export const MOCK_ACTIONS: ActionItem[] = [
  { employeeName: 'Mara Simensen', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Complete' },
  { employeeName: 'Genevieve Campisano', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'In progress' },
  { employeeName: 'Adriana Marsocci', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Complete' },
  { employeeName: 'Mara Simensen', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Complete' },
  { employeeName: 'Genevieve Campisano', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Not started' },
  { employeeName: 'Rebecca Cadden', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Not started' },
  { employeeName: 'Andrea Arevalo', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Not started' },
  { employeeName: 'Mara Simensen', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Not started' },
  { employeeName: 'Rebecca Cadden', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'Complete' },
  { employeeName: 'Genevieve Campisano', program: 'Cell text', task: 'Cell text', relationship: 'Cell text', dueDate: 'Cell text', status: 'In progress' },
]
