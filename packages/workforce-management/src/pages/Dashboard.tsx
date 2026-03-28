import { useState, useRef, useCallback, useMemo, useEffect, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SizeColumnsToFitGridStrategy } from 'ag-grid-community'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

interface WorkforceEmployee {
  employeeId: string
  fullName: string
  department: string
  role: string
  manager: string
  status: string
  hireDate: string
  location: string
}

const MOCK_EMPLOYEES: WorkforceEmployee[] = [
  { employeeId: 'EMP001', fullName: 'Sarah Johnson', department: 'Engineering', role: 'Senior Developer', manager: 'Mike Chen', status: 'Active', hireDate: '2021-03-15', location: 'New York' },
  { employeeId: 'EMP002', fullName: 'James Wilson', department: 'Marketing', role: 'Marketing Manager', manager: 'Lisa Park', status: 'Active', hireDate: '2020-07-22', location: 'Chicago' },
  { employeeId: 'EMP003', fullName: 'Emily Davis', department: 'Human Resources', role: 'HR Specialist', manager: 'Robert Kim', status: 'On Leave', hireDate: '2019-11-03', location: 'San Francisco' },
  { employeeId: 'EMP004', fullName: 'Michael Brown', department: 'Engineering', role: 'DevOps Engineer', manager: 'Mike Chen', status: 'Active', hireDate: '2022-01-10', location: 'New York' },
  { employeeId: 'EMP005', fullName: 'Jessica Martinez', department: 'Finance', role: 'Financial Analyst', manager: 'David Lee', status: 'Active', hireDate: '2021-09-08', location: 'Dallas' },
  { employeeId: 'EMP006', fullName: 'Daniel Thompson', department: 'Engineering', role: 'Frontend Developer', manager: 'Mike Chen', status: 'Active', hireDate: '2023-02-14', location: 'Remote' },
  { employeeId: 'EMP007', fullName: 'Amanda Garcia', department: 'Sales', role: 'Account Executive', manager: 'Tom Harris', status: 'Active', hireDate: '2020-05-19', location: 'Chicago' },
  { employeeId: 'EMP008', fullName: 'Christopher Lee', department: 'Engineering', role: 'QA Engineer', manager: 'Mike Chen', status: 'Terminated', hireDate: '2019-08-25', location: 'New York' },
  { employeeId: 'EMP009', fullName: 'Rachel Anderson', department: 'Marketing', role: 'Content Strategist', manager: 'Lisa Park', status: 'Active', hireDate: '2022-06-01', location: 'Remote' },
  { employeeId: 'EMP010', fullName: 'Kevin Patel', department: 'Finance', role: 'Senior Accountant', manager: 'David Lee', status: 'Active', hireDate: '2018-12-11', location: 'Dallas' },
  { employeeId: 'EMP011', fullName: 'Lauren White', department: 'Human Resources', role: 'Recruiter', manager: 'Robert Kim', status: 'Active', hireDate: '2023-04-17', location: 'San Francisco' },
  { employeeId: 'EMP012', fullName: 'Brian Taylor', department: 'Sales', role: 'Sales Director', manager: 'Tom Harris', status: 'Active', hireDate: '2019-02-28', location: 'Chicago' },
  { employeeId: 'EMP013', fullName: 'Megan Clark', department: 'Engineering', role: 'Data Engineer', manager: 'Mike Chen', status: 'On Leave', hireDate: '2021-11-30', location: 'New York' },
  { employeeId: 'EMP014', fullName: 'Steven Robinson', department: 'Operations', role: 'Operations Manager', manager: 'Nancy Wright', status: 'Active', hireDate: '2020-10-05', location: 'Dallas' },
  { employeeId: 'EMP015', fullName: 'Nicole Hernandez', department: 'Marketing', role: 'SEO Specialist', manager: 'Lisa Park', status: 'Active', hireDate: '2023-07-20', location: 'Remote' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  'On Leave': { bg: '#fef9c3', color: '#854d0e', label: 'On Leave' },
  Terminated: { bg: '#f3f4f6', color: '#6b7280', label: 'Terminated' },
}

function StatusCellRenderer({ value }: { value: string }) {
  const style = STATUS_STYLES[value] || STATUS_STYLES.Active
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        lineHeight: '18px',
      }}
    >
      {style.label}
    </span>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return dateStr.substring(0, 10)
}

const paginationPageSizeSelector = [5, 10, 20]

function ColumnSettingsPanel({
  columnDefs,
  visibleColumns,
  onToggle,
  onClose,
  anchorRef,
}: {
  columnDefs: ColDef[]
  visibleColumns: Record<string, boolean>
  onToggle: (field: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 220 })
    }
  }, [anchorRef])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  return createPortal(
    <div ref={panelRef} className="wfm__col-panel" style={{ top: pos.top, left: pos.left }}>
      <div className="wfm__col-panel-header">Column Settings</div>
      {columnDefs.map(col => {
        const field = col.field || col.colId || ''
        if (!field) return null
        return (
          <label key={field} className="wfm__col-panel-item">
            <input
              type="checkbox"
              checked={visibleColumns[field] !== false}
              onChange={() => onToggle(field)}
            />
            <span>{col.headerName || field}</span>
          </label>
        )
      })}
    </div>,
    document.body,
  )
}

export default function Dashboard() {
  const [quickFilterText, setQuickFilterText] = useState<string>()
  const [showColSettings, setShowColSettings] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const gridRef = useRef<AgGridReact>(null)
  const colSettingsBtnRef = useRef<HTMLButtonElement>(null)

  const allColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'employeeId', headerName: 'Employee ID', width: 120 },
    {
      field: 'fullName',
      headerName: 'Employee Name',
      flex: 1.5,
      minWidth: 180,
      cellStyle: { color: '#007aff', fontWeight: 500 },
    },
    { field: 'department', headerName: 'Department', flex: 1, minWidth: 130 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
    { field: 'manager', headerName: 'Manager', flex: 1, minWidth: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: 'hireDate',
      headerName: 'Hire Date',
      width: 130,
      valueFormatter: (params) => formatDate(params.value),
    },
    { field: 'location', headerName: 'Location', width: 140 },
  ], [])

  const columnDefs = useMemo<ColDef[]>(
    () => allColumnDefs.filter(col => {
      const field = col.field || col.colId || ''
      return visibleColumns[field] !== false
    }),
    [allColumnDefs, visibleColumns],
  )

  const handleColumnToggle = useCallback((field: string) => {
    setVisibleColumns(prev => ({ ...prev, [field]: prev[field] === false }))
  }, [])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: false,
    resizable: true,
  }), [])

  const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(() => ({
    type: 'fitGridWidth',
  }), [])

  const onFilterTextBoxChanged = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => setQuickFilterText(value),
    [],
  )

  return (
    <div>
      <h1 className="wfm__title">Workforce Management</h1>

      {/* Metric Cards */}
      <div className="wfm__metrics">
        <div className="wfm__metric-card">
          <div className="wfm__metric-icon" style={{ background: '#EFF6FF' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="wfm__metric-info">
            <div className="wfm__metric-value">100%</div>
            <div className="wfm__metric-label">Response Rate</div>
            <div className="wfm__metric-detail">22 of 22</div>
          </div>
        </div>

        <div className="wfm__metric-card">
          <div className="wfm__metric-icon" style={{ background: '#ECFDF5' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="wfm__metric-info">
            <div className="wfm__metric-value">95%</div>
            <div className="wfm__metric-label">Completion Rate</div>
            <div className="wfm__metric-detail">21 complete</div>
          </div>
        </div>

        <div className="wfm__metric-card">
          <div className="wfm__metric-icon" style={{ background: '#FEF3C7' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="wfm__metric-info">
            <div className="wfm__metric-value" style={{ color: '#D97706' }}>3.5</div>
            <div className="wfm__metric-label">Average Score</div>
            <div className="wfm__metric-detail">out of 5.0</div>
          </div>
        </div>

        <div className="wfm__metric-card">
          <div className="wfm__metric-icon" style={{ background: '#FEF2F2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="wfm__metric-info">
            <div className="wfm__metric-value" style={{ color: '#DC2626' }}>-36</div>
            <div className="wfm__metric-label">eNPS</div>
            <div className="wfm__metric-detail">Employee Net Promoter</div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="wfm__table-card">
        <div className="wfm__toolbar">
          <div className="wfm__toolbar-right">
            <div className="wfm__search-wrap">
              <svg className="wfm__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-.82 4.74a6 6 0 1 1 1.06-1.06l2.79 2.79a.75.75 0 1 1-1.06 1.06l-2.79-2.79Z" fill="currentColor"/>
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                onInput={onFilterTextBoxChanged}
                className="wfm__search-input"
              />
            </div>

            <button
              className={`wfm__icon-btn${isFavorited ? ' wfm__icon-btn--active' : ''}`}
              onClick={() => setIsFavorited(!isFavorited)}
              title="Favorite"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorited ? '#F59E0B' : 'none'} stroke={isFavorited ? '#F59E0B' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>

            <button
              ref={colSettingsBtnRef}
              className={`wfm__icon-btn${showColSettings ? ' wfm__icon-btn--active' : ''}`}
              onClick={() => setShowColSettings(!showColSettings)}
              title="Column Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            {showColSettings && (
              <ColumnSettingsPanel
                columnDefs={allColumnDefs}
                visibleColumns={visibleColumns}
                onToggle={handleColumnToggle}
                onClose={() => setShowColSettings(false)}
                anchorRef={colSettingsBtnRef}
              />
            )}
          </div>
        </div>

        <div className="ag-theme-quartz wfm__grid">
          <AgGridReact
            ref={gridRef}
            rowData={MOCK_EMPLOYEES}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoSizeStrategy={autoSizeStrategy}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={paginationPageSizeSelector}
            quickFilterText={quickFilterText}
            domLayout="autoHeight"
            rowHeight={40}
            getRowId={(params) => params.data.employeeId}
            overlayNoRowsTemplate="<span style='padding:40px;color:#86868b;font-size:14px'>No employees found</span>"
          />
        </div>
      </div>
    </div>
  )
}
