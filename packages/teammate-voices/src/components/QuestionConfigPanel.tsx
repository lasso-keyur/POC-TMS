import { useState } from 'react'
import { Select, Input } from '../design-system'
import type { SelectOption } from '../design-system'
import ToggleSwitch from '@/components/ToggleSwitch'
import type { SurveyQuestion } from '@/types/survey'

interface QuestionConfigPanelProps {
  question: SurveyQuestion
  questionIdx: number
  allQuestions: SurveyQuestion[]
  onChange: (updated: SurveyQuestion) => void
  onClose: () => void
}

type VisibilityConditionOperator = 'equals' | 'not_equals' | 'is_empty' | 'is_not_empty' | 'contains' | 'greater_than' | 'less_than'

interface VisibilityCondition {
  sourceQuestionIdx: number
  operator: VisibilityConditionOperator
  value: string
}

interface QuestionConfig {
  visibilityEnabled: boolean
  visibilityCondition: VisibilityCondition | null
  validationMin?: string
  validationMax?: string
  validationPattern?: string
  skipToQuestionIdx?: number
  defaultValue?: string
}

const OPERATOR_OPTIONS: SelectOption[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
]

function parseConfig(q: SurveyQuestion): QuestionConfig {
  // Store config in secondaryType as JSON (using existing field)
  if (q.secondaryType) {
    try {
      return JSON.parse(q.secondaryType)
    } catch { /* ignore */ }
  }
  return {
    visibilityEnabled: false,
    visibilityCondition: null,
  }
}

function needsValueInput(op: VisibilityConditionOperator): boolean {
  return op !== 'is_empty' && op !== 'is_not_empty'
}

export default function QuestionConfigPanel({
  question,
  questionIdx,
  allQuestions,
  onChange,
}: QuestionConfigPanelProps) {
  const [config, setConfig] = useState<QuestionConfig>(() => parseConfig(question))

  const otherQuestions = allQuestions
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => i !== questionIdx)

  const sourceQuestionOptions: SelectOption[] = otherQuestions.map(({ q, i }) => ({
    value: String(i),
    label: `Q${i + 1}: ${q.questionText || 'Untitled'}`,
  }))

  const skipToOptions: SelectOption[] = [
    { value: '', label: 'None' },
    ...allQuestions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => i > questionIdx)
      .map(({ q, i }) => ({
        value: String(i),
        label: `Q${i + 1}: ${q.questionText || 'Untitled'}`,
      })),
  ]

  // Get answer options from source question if it has choices
  const sourceQ = config.visibilityCondition
    ? allQuestions[config.visibilityCondition.sourceQuestionIdx]
    : null
  const sourceHasOptions = sourceQ?.options && sourceQ.options.length > 0
  const sourceValueOptions: SelectOption[] = sourceHasOptions
    ? sourceQ!.options!.map(o => ({ value: o.optionText, label: o.optionText }))
    : []

  const saveConfig = (updated: QuestionConfig) => {
    setConfig(updated)
    onChange({ ...question, secondaryType: JSON.stringify(updated) })
  }

  const handleVisibilityToggle = (enabled: boolean) => {
    saveConfig({
      ...config,
      visibilityEnabled: enabled,
      visibilityCondition: enabled
        ? { sourceQuestionIdx: otherQuestions[0]?.i ?? 0, operator: 'equals', value: '' }
        : null,
    })
  }

  return (
    <div className="question-config">
      {/* Conditional Visibility */}
      <div className="question-config__section">
        <div className="question-config__section-header">
          <span className="question-config__section-label">Conditional Visibility</span>
          <ToggleSwitch
            label=""
            checked={config.visibilityEnabled}
            onChange={handleVisibilityToggle}
          />
        </div>
        <p className="question-config__hint">Only show this question when a condition is met.</p>

        {config.visibilityEnabled && config.visibilityCondition && otherQuestions.length > 0 && (
          <div className="question-config__condition">
            <div className="question-config__condition-row">
              <span className="question-config__condition-label">IF</span>
              <div className="question-config__condition-field">
                <Select
                  options={sourceQuestionOptions}
                  value={String(config.visibilityCondition.sourceQuestionIdx)}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      visibilityCondition: {
                        ...config.visibilityCondition!,
                        sourceQuestionIdx: Number(e.target.value),
                        value: '',
                      },
                    })
                  }
                  fullWidth
                />
              </div>
            </div>
            <div className="question-config__condition-row">
              <span className="question-config__condition-label" />
              <div className="question-config__condition-field">
                <Select
                  options={OPERATOR_OPTIONS}
                  value={config.visibilityCondition.operator}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      visibilityCondition: {
                        ...config.visibilityCondition!,
                        operator: e.target.value as VisibilityConditionOperator,
                      },
                    })
                  }
                  fullWidth
                />
              </div>
              {needsValueInput(config.visibilityCondition.operator) && (
                <div className="question-config__condition-field">
                  {sourceHasOptions ? (
                    <Select
                      options={sourceValueOptions}
                      value={config.visibilityCondition.value}
                      placeholder="Select value"
                      onChange={(e) =>
                        saveConfig({
                          ...config,
                          visibilityCondition: {
                            ...config.visibilityCondition!,
                            value: e.target.value,
                          },
                        })
                      }
                      fullWidth
                    />
                  ) : (
                    <Input
                      value={config.visibilityCondition.value}
                      placeholder="Enter value"
                      onChange={(e) =>
                        saveConfig({
                          ...config,
                          visibilityCondition: {
                            ...config.visibilityCondition!,
                            value: e.target.value,
                          },
                        })
                      }
                      fullWidth
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      <div className="question-config__section">
        <span className="question-config__section-label">Validation</span>
        <p className="question-config__hint">Set min/max or pattern constraints for answers.</p>
        <div className="question-config__validation-row">
          <div className="question-config__validation-field">
            <Input
              label="Min value"
              value={config.validationMin || ''}
              placeholder="e.g. 1"
              onChange={(e) => saveConfig({ ...config, validationMin: e.target.value })}
              fullWidth
            />
          </div>
          <div className="question-config__validation-field">
            <Input
              label="Max value"
              value={config.validationMax || ''}
              placeholder="e.g. 100"
              onChange={(e) => saveConfig({ ...config, validationMax: e.target.value })}
              fullWidth
            />
          </div>
        </div>
        <div className="question-config__validation-field" style={{ marginTop: 8 }}>
          <Input
            label="Regex pattern"
            value={config.validationPattern || ''}
            placeholder="e.g. ^[a-zA-Z]+$"
            onChange={(e) => saveConfig({ ...config, validationPattern: e.target.value })}
            fullWidth
          />
        </div>
      </div>

      {/* Skip Logic */}
      <div className="question-config__section">
        <span className="question-config__section-label">Skip Logic</span>
        <p className="question-config__hint">Skip to a later question based on the answer to this question.</p>
        <Select
          options={skipToOptions}
          value={config.skipToQuestionIdx !== undefined ? String(config.skipToQuestionIdx) : ''}
          placeholder="No skip"
          onChange={(e) =>
            saveConfig({
              ...config,
              skipToQuestionIdx: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          fullWidth
        />
      </div>

      {/* Default Value */}
      <div className="question-config__section">
        <span className="question-config__section-label">Default Value</span>
        <p className="question-config__hint">Pre-fill this question with a default answer.</p>
        <Input
          value={config.defaultValue || ''}
          placeholder="Enter default value"
          onChange={(e) => saveConfig({ ...config, defaultValue: e.target.value })}
          fullWidth
        />
      </div>

    </div>
  )
}
