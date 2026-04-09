/**
 * Converts an array of objects to a CSV string.
 * @param rows - Array of objects with string or number values
 * @param columns - Optional ordered list of column keys to use as headers
 * @returns CSV formatted string
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (rows.length === 0) return ''

  const headers = columns ?? Object.keys(rows[0])

  const escape = (value: string | number): string => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map(escape).join(',')

  const dataRows = rows.map(row =>
    headers.map(header => escape(row[header] ?? '')).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}