export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
}

export function DataTable<T extends { id: string }>({ columns, data }: DataTableProps<T>) {
  if (data.length === 0) {
    return <p>No data to display</p>
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              style={{
                textAlign: 'left',
                padding: '12px 8px',
                borderBottom: '2px solid #e5e7eb',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            {columns.map((col) => (
              <td key={String(col.key)} style={{ padding: '12px 8px' }}>
                {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
