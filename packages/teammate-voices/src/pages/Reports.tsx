import { useState, useEffect } from 'react'
import { Card, CardBody, Input } from '../design-system'
import Breadcrumb from '@/components/Breadcrumb'
import DataTable from '@/components/DataTable'
import type { Column } from '@/components/DataTable'
import { api } from '@/services/api'
import type { Participant } from '@/types/participant'

interface StatCard {
  label: string
  value: number | string
  color: string
  icon: React.ReactNode
}

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`reports__badge ${active ? 'reports__badge--active' : 'reports__badge--inactive'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
)

const TypeBadge = ({ type }: { type: string }) => (
  <span className="reports__badge reports__badge--type">
    {type.replace(/_/g, ' ')}
  </span>
)

const COLUMNS: Column<Participant>[] = [
  { key: 'fullName', label: 'Name', render: (row) => <span className="reports__name">{row.fullName}</span> },
  { key: 'email', label: 'Email' },
  { key: 'participantType', label: 'Type', render: (row) => <TypeBadge type={row.participantType} /> },
  { key: 'trainingProgram', label: 'Program', render: (row) => row.trainingProgram || '\u2014' },
  { key: 'cohort', label: 'Cohort', render: (row) => row.cohort || '\u2014' },
  { key: 'startDate', label: 'Start Date', render: (row) => new Date(row.startDate).toLocaleDateString() },
  { key: 'isActive', label: 'Status', render: (row) => <StatusBadge active={row.isActive} /> },
]

export default function Reports() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    api.getParticipants()
      .then(setParticipants)
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = participants.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || p.participantType === filterType
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && p.isActive) ||
      (filterStatus === 'inactive' && !p.isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  const totalActive = participants.filter(p => p.isActive).length
  const totalInactive = participants.length - totalActive
  const newHires = participants.filter(p => p.participantType === 'NEW_HIRE').length

  const stats: StatCard[] = [
    {
      label: 'Total Participants',
      value: participants.length,
      color: '#012169',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#012169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Active',
      value: totalActive,
      color: '#065F46',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Inactive',
      value: totalInactive,
      color: '#991B1B',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      label: 'New Hires',
      value: newHires,
      color: '#1D4ED8',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Reports' }]} />

      <div className="reports">
        <div className="reports__header">
          <h1 className="reports__title">Reports</h1>
          <p className="reports__subtitle">Participant overview and engagement data</p>
        </div>

        {/* Summary stat cards */}
        <div className="reports__stats">
          {stats.map(stat => (
            <Card key={stat.label} variant="outlined" padding="md">
              <CardBody>
                <div className="reports__stat-card">
                  <div className="reports__stat-icon" style={{ backgroundColor: `${stat.color}10` }}>
                    {stat.icon}
                  </div>
                  <div className="reports__stat-info">
                    <span className="reports__stat-value" style={{ color: stat.color }}>{stat.value}</span>
                    <span className="reports__stat-label">{stat.label}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Data grid section */}
        <div className="reports__grid-section">
          <div className="reports__grid-header">
            <h2 className="reports__grid-title">Participants</h2>
          </div>

          <div className="reports__filters">
            <div className="reports__search">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                fullWidth
              />
            </div>
            <select
              className="reports__filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="NEW_HIRE">New Hire</option>
              <option value="EXISTING_RESOURCE">Existing Resource</option>
            </select>
            <select
              className="reports__filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="reports__loading">
              <p>Loading participant data...</p>
            </div>
          ) : (
            <DataTable
              columns={COLUMNS}
              data={filtered}
              emptyMessage={search || filterType !== 'all' || filterStatus !== 'all'
                ? 'No participants match your filters'
                : 'No participants found'}
              rowKey={(row) => row.participantId}
            />
          )}
        </div>
      </div>
    </>
  )
}
