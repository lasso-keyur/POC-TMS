import { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../design-system'
import { api } from '@/services/api'

interface Check {
  key: string
  label: string
  passed: boolean
  detail: string
}

interface Props {
  open: boolean
  surveyId: number
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function PublishPreflightModal({ open, surveyId, onClose, onConfirm }: Props) {
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [allPassed, setAllPassed] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.validateDispatch(surveyId)
      .then(result => {
        setChecks(result.checks)
        setAllPassed(result.passed)
      })
      .catch(() => setChecks([]))
      .finally(() => setLoading(false))
  }, [open, surveyId])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setPublishing(false)
    }
  }

  const passedCount = checks.filter(c => c.passed).length

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <div className="preflight-modal__header">
          <div className="preflight-modal__title-row">
            <span className="preflight-modal__icon">🚀</span>
            <div>
              <h2 className="preflight-modal__title">Pre-flight Checklist</h2>
              <p className="preflight-modal__subtitle">
                Review these checks before publishing your survey.
              </p>
            </div>
          </div>
          {!loading && checks.length > 0 && (
            <span className={`preflight-modal__score ${allPassed ? 'preflight-modal__score--pass' : 'preflight-modal__score--warn'}`}>
              {passedCount} / {checks.length} passed
            </span>
          )}
        </div>
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="preflight-modal__loading">
            <span className="preflight-modal__spinner" />
            Running checks…
          </div>
        ) : checks.length === 0 ? (
          <p className="preflight-modal__empty">Could not run validation checks. You can still publish.</p>
        ) : (
          <ul className="preflight-modal__list">
            {checks.map(check => (
              <li key={check.key} className={`preflight-modal__item ${check.passed ? 'preflight-modal__item--pass' : 'preflight-modal__item--fail'}`}>
                <span className="preflight-modal__item-icon">
                  {check.passed ? '✅' : '❌'}
                </span>
                <div className="preflight-modal__item-body">
                  <span className="preflight-modal__item-label">{check.label}</span>
                  <span className="preflight-modal__item-detail">{check.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && !allPassed && checks.length > 0 && (
          <div className="preflight-modal__warning">
            ⚠️ Some checks failed. You can still publish, but emails may not send correctly until all issues are resolved.
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="preflight-modal__footer">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={publishing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            loading={publishing}
            disabled={loading}
          >
            {publishing ? 'Publishing…' : allPassed ? '✓ Publish' : 'Publish Anyway'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}
