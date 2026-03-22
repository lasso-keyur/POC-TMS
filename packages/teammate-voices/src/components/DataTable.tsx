import { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  onRowAction?: (row: T) => void
  rowKey?: (row: T) => string | number
}

export default function DataTable<T>({ columns, data, emptyMessage = 'No data available', onRowAction, rowKey }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const totalRows = data.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const startIdx = (currentPage - 1) * rowsPerPage
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows)
  const visibleData = data.slice(startIdx, endIdx)

  return (
    <div className="dt">
      <div className="dt__table-wrap">
        <table className="dt__table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="dt__th">{col.label}</th>
              ))}
              {onRowAction && <th className="dt__th">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td className="dt__td" colSpan={columns.length + (onRowAction ? 1 : 0)} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleData.map((row, idx) => (
                <tr key={rowKey ? rowKey(row) : idx} className="dt__tr">
                  {columns.map(col => (
                    <td key={col.key} className="dt__td">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {onRowAction && (
                    <td className="dt__td dt__td--action">
                      <button className="dt__menu-btn" aria-label="Actions" onClick={() => onRowAction(row)}>
                        <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                          <circle cx="2" cy="2" r="1.5" fill="#6E6E73" />
                          <circle cx="2" cy="8" r="1.5" fill="#6E6E73" />
                          <circle cx="2" cy="14" r="1.5" fill="#6E6E73" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRows > 0 && (
        <div className="dt__pagination">
          <span className="dt__pagination-info">
            Showing {startIdx + 1}-{endIdx} of {totalRows}
          </span>
          <div className="dt__pagination-controls">
            <label className="dt__pagination-label">
              Rows per page
              <select
                className="dt__select"
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
      )}
    </div>
  )
}
