/**
 * Escapes a value for CSV output by wrapping in double quotes if necessary.
 * Internal double quotes are escaped by doubling them.
 */
function escapeCsvValue(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts an array of objects to CSV format.
 * @param rows - The array of objects to convert
 * @param columns - Optional array of column keys to control order and which columns are included
 * @returns A CSV-formatted string
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (rows.length === 0) return ''

  const keys = columns ?? [...new Set(rows.flatMap((row) => Object.keys(row)))]

  const header = keys.join(',')
  const body = rows
    .map((row) => keys.map((key) => escapeCsvValue(row[key] ?? '')).join(','))
    .join('\n')

  return `${header}\n${body}`
}
