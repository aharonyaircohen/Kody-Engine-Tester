/**
 * Converts an array of objects to a CSV-formatted string.
 * @param rows - Array of objects with string or number values
 * @param columns - Optional array of column keys to include (defaults to all keys)
 * @returns CSV-formatted string with headers and quoted values
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (rows.length === 0) return ''

  const keys = columns ?? Object.keys(rows[0])

  const escape = (value: string | number): string => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = keys.join(',')
  const data = rows.map((row) => keys.map((key) => escape(row[key])).join(','))
  return [header, ...data].join('\n')
}
