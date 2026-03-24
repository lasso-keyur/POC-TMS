import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../../design-system'
import RuleCard from './RuleCard'
import RuleEditorForm from './RuleEditorForm'
import type { QuestionInfo } from './types'
import { createEmptyRule } from './types'
import type { LogicRule } from '@/types/logic'

interface LogicRulesPopupProps {
  open: boolean
  onClose: () => void
  question: QuestionInfo
  /** All rules where this question is a condition source */
  rules: LogicRule[]
  /** All rules where this question is an action target (for context) */
  targetRules: LogicRule[]
  allQuestions: QuestionInfo[]
  pages: { id: string; label: string }[]
  onSaveRule: (rule: LogicRule) => void
  onDeleteRule: (ruleId: string) => void
}

export default function LogicRulesPopup({
  open, onClose, question, rules, targetRules,
  allQuestions, pages, onSaveRule, onDeleteRule,
}: LogicRulesPopupProps) {
  const totalRules = rules.length + targetRules.length

  // Auto-open editor when no rules exist (skip the empty list view)
  const [editingRule, setEditingRule] = useState<LogicRule | null>(
    totalRules === 0 ? createEmptyRule(question.id) : null
  )

  const handleAddNew = () => {
    setEditingRule(createEmptyRule(question.id))
  }

  const handleEdit = (rule: LogicRule) => {
    setEditingRule({ ...rule })
  }

  const handleSave = (rule: LogicRule) => {
    onSaveRule(rule)
    setEditingRule(null)
  }

  const handleCancel = () => {
    // If no rules exist and user cancels the auto-opened editor, close the popup entirely
    if (totalRules === 0) {
      onClose()
      return
    }
    setEditingRule(null)
  }

  const handleClose = () => {
    setEditingRule(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <ModalHeader>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span><span className="cfg-popup__title-icon">⚙</span> Logic rules — {question.label}</span>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#86868b', padding: '2px 6px' }} aria-label="Close">✕</button>
        </span>
      </ModalHeader>
      <ModalBody>
        {editingRule ? (
          <RuleEditorForm
            rule={editingRule}
            questions={allQuestions}
            pages={pages}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="cfg-popup__list">
            {rules.length > 0 && (
              <div className="cfg-popup__section">
                <h5 className="cfg-popup__section-title">Rules from this question</h5>
                {rules.map(r => (
                  <RuleCard
                    key={r.id}
                    rule={r}
                    questions={allQuestions}
                    onEdit={() => handleEdit(r)}
                    onDelete={() => onDeleteRule(r.id)}
                  />
                ))}
              </div>
            )}

            {targetRules.length > 0 && (
              <div className="cfg-popup__section">
                <h5 className="cfg-popup__section-title">Rules targeting this question</h5>
                {targetRules.map(r => (
                  <RuleCard
                    key={r.id}
                    rule={r}
                    questions={allQuestions}
                    onEdit={() => handleEdit(r)}
                    onDelete={() => onDeleteRule(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </ModalBody>
      {!editingRule && (
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={handleClose}>Close</Button>
          <Button variant="primary" size="sm" onClick={handleAddNew}>+ Add another rule</Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
