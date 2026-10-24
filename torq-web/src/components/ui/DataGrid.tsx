import type { ReactNode } from 'react'
import { EmptyState } from './layout'

export type DataGridColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
}

export type DataGridProps<T> = {
  columns: DataGridColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
  emptyIcon?: ReactNode
  className?: string
}

/** Lightweight table for list pages. */
export function DataGrid<T>({ columns, rows, rowKey, empty, emptyIcon, className }: DataGridProps<T>) {
  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon}>{empty ?? 'No items yet.'}</EmptyState>
  }

  return (
    <div className={`data-grid-wrap ${className ?? ''}`.trim()}>
      <table className="table data-grid">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
