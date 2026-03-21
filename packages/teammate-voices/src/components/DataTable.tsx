import { useState } from 'react'
import type { ActionItem, ActionStatus } from '@/types/dashboard'

interface Column {
  key: keyof ActionItem
  label: string
  render?: (value: string, row: ActionItem) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: ActionItem[]
  totalRows: number
}

function StatusCell({ status }: { status: ActionStatus }) {
  if (status === 'Complete') {
    return <span className="dt-status dt-status--complete">{status}</span>
  }
  if (status === 'In progress') {
    return (
      <span className="dt-status dt-status--progress">
        <span className="dt-status__dot dt-status__dot--blue" />
        {status}
      </span>
    )
  }
  return (
    <span className="dt-status dt-status--not-started">
      <span className="dt-status__dot dt-status__dot--red" />
      {status}
    </span>
  )
}

export default function DataTable({ columns, data, totalRows }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(8)

  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startRow = (currentPage - 1) * rowsPerPage + 1
  const endRow = Math.min(currentPage * rowsPerPage, totalRows)
  const visibleData = data.slice(0, rowsPerPage)

  return (
    <div className="dt">
      <div className="dt__table-wrap">
        <table className="dt__table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="dt__th">{col.label}</th>
              ))}
              <th className="dt__th">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, idx) => (
              <tr key={idx} className="dt__tr">
                {columns.map(col => (
                  <td key={col.key} className="dt__td">
                    {col.key === 'employeeName' ? (
                      <a href="#" className="dt__link">{row[col.key]}</a>
                    ) : col.key === 'status' ? (
                      <StatusCell status={row.status} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                <td className="dt__td dt__td--action">
                  <button className="dt__menu-btn" aria-label="Actions">
                    <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                      <circle cx="2" cy="2" r="1.5" fill="#6E6E73" />
                      <circle cx="2" cy="8" r="1.5" fill="#6E6E73" />
                      <circle cx="2" cy="14" r="1.5" fill="#6E6E73" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dt__pagination">
        <span className="dt__pagination-info">
          Showing {startRow}-{endRow} of {totalRows}
        </span>
        <div className="dt__pagination-controls">
          <label className="dt__pagination-label">
            Rows per page
            <select
              className="dt__select"
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <label className="dt__pagination-label">
            Page
            <select
              className="dt__select"
              value={currentPage}
              onChange={e => setCurrentPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
          <button
            className="dt__page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <button
            className="dt__page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
