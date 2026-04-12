'use client'

import { useState } from 'react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
}

export function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    : data

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => handleSort(String(col.key))}
                style={{
                  padding: '12px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: '#374151',
                  fontWeight: 600,
                }}
              >
                {col.header}
                {sortKey === String(col.key) && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={String(item[keyField])} style={{ borderBottom: '1px solid #e5e7eb' }}>
              {columns.map((col) => (
                <td key={String(col.key)} style={{ padding: '10px 8px', color: '#1f2937' }}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[String(col.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
