export interface LogicRule {
  id: string
  type: 'visible_if' | 'required_if' | 'skip_to' | 'pipe_text'
  conditions: {
    operator: 'AND' | 'OR'
    items: LogicCondition[]
  }
  action: LogicAction
}

export type ConditionType = 'question' | 'participant'

export const PARTICIPANT_FIELDS: { value: string; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'lineOfBusiness', label: 'Line of Business' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'participantType', label: 'Participant Type' },
  { value: 'hierarchyCode', label: 'Hierarchy Code' },
]

export interface LogicCondition {
  conditionType?: ConditionType  // 'question' (default) | 'participant'
  questionId?: string            // required when conditionType = 'question'
  participantField?: string      // required when conditionType = 'participant'
  operator: LogicOperator
  value: string | number | string[]
}

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'any_of'

export interface LogicAction {
  type: 'show' | 'hide' | 'require' | 'skip_to' | 'pipe'
  targetQuestionId?: string
  targetPageId?: string
  pipeField?: string
}

export interface LogicEvaluationResult {
  visibilityMap: Record<string, boolean>
  requiredMap: Record<string, boolean>
  skipTarget?: string
  pipedValues: Record<string, string>
}

export const RULE_TYPE_LABELS: Record<LogicRule['type'], string> = {
  visible_if: 'Show/Hide',
  required_if: 'Make Required',
  skip_to: 'Skip To',
  pipe_text: 'Pipe Text',
}

export const ACTION_TYPE_LABELS: Record<LogicAction['type'], string> = {
  show: 'Show',
  hide: 'Hide',
  require: 'Require',
  skip_to: 'Skip to',
  pipe: 'Pipe',
}

export const OPERATOR_LABELS: Record<LogicOperator, string> = {
  equals: 'Equals',
  not_equals: 'Does not equal',
  greater_than: 'Greater than',
  less_than: 'Less than',
  between: 'Between',
  contains: 'Contains',
  not_contains: 'Does not contain',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
  any_of: 'Is any of',
}

export const CHOICE_OPERATORS: LogicOperator[] = ['equals', 'not_equals', 'is_empty', 'is_not_empty']
export const RATING_OPERATORS: LogicOperator[] = ['equals', 'not_equals', 'greater_than', 'less_than', 'between']
export const TEXT_OPERATORS: LogicOperator[] = ['contains', 'not_contains', 'is_empty', 'is_not_empty', 'equals', 'not_equals']
export const MULTI_CHOICE_OPERATORS: LogicOperator[] = ['any_of', 'equals', 'is_empty', 'is_not_empty']
