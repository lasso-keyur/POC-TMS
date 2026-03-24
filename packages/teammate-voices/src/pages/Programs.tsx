import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../design-system'
import Breadcrumb from '@/components/Breadcrumb'
import ToggleSwitch from '@/components/ToggleSwitch'
import ProgramCard from '@/components/ProgramCard'
import { api } from '@/services/api'
import type { Program } from '@/types/program'

export default function Programs() {
  const [hideInactive, setHideInactive] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getPrograms()
      .then(setPrograms)
      .catch(err => console.error('Failed to load programs:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = useCallback(async (programId: number) => {
    const program = programs.find(p => p.programId === programId)
    if (!program) return

    try {
      // Check if any surveys are linked to this program
      const allSurveys = await api.getSurveys()
      const linkedSurveys = allSurveys.filter(s => s.programId === programId)

      if (linkedSurveys.length > 0) {
        const proceed = confirm(
          `"${program.name}" has ${linkedSurveys.length} survey(s) aligned to it.\n\n` +
          `The surveys will be preserved but unlinked from this program.\n\n` +
          `Continue deleting "${program.name}"?`
        )
        if (!proceed) return

        // Unlink surveys by setting programId to null
        for (const survey of linkedSurveys) {
          await api.updateSurvey(survey.surveyId, { ...survey, programId: undefined })
        }
      } else {
        const proceed = confirm(`Delete "${program.name}"? This cannot be undone.`)
        if (!proceed) return
      }

      await api.deleteProgram(programId)
      setPrograms(prev => prev.filter(p => p.programId !== programId))
    } catch (err) {
      alert('Failed to delete program: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }, [programs])

  const filteredPrograms = hideInactive
    ? programs.filter(p => p.status === 'Active' || p.status === 'ACTIVE')
    : programs

  return (
    <>
      <Breadcrumb items={[
        { label: 'Survey', path: '/' },
        { label: 'Programs' },
      ]} />

      <h1 className="programs-page__title">Programs</h1>

      <div className="programs-page">
      <div className="programs-page__controls">
        <ToggleSwitch
          label="Hide inactive"
          checked={hideInactive}
          onChange={setHideInactive}
        />
        <Link to="/programs/new" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm">+ Add program</Button>
        </Link>
      </div>

      <div className="programs-page__grid">
        {loading ? (
          <p>Loading programs...</p>
        ) : filteredPrograms.length === 0 ? (
          <p>No programs found.</p>
        ) : (
          filteredPrograms.map(program => (
            <ProgramCard
              key={program.programId}
              program={program}
              onEdit={(id) => navigate(`/programs/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
      </div>
    </>
  )
}
