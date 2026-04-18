'use client'

import { useState } from 'react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  width?: string
}

interface AdminDataTableProps<T extends { id: string }> {
  title: string
  columns: Column<T>[]
  rows: T[]
  totalDocs: number
  page: number
  limit: number
  onPageChange: (newPage: number) => void
  emptyMessage?: string
}

export function AdminDataTable<T extends { id: string }>({
  title,
  columns,
  rows,
  totalDocs,
  page,
  limit,
  onPageChange,
  emptyMessage = 'No data available.',
}: AdminDataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>
          {title}
        </h3>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {totalDocs} total
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      style={{ padding: '10px 16px', color: '#374151', verticalAlign: 'middle' }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: page <= 1 ? '#f9fafb' : '#fff',
                color: page <= 1 ? '#9ca3af' : '#374151',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: 13,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: page >= totalPages ? '#f9fafb' : '#fff',
                color: page >= totalPages ? '#9ca3af' : '#374151',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: 13,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
