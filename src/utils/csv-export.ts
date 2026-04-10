/**
 * Converts an array of objects to a CSV-formatted string.
 * Values containing commas, double quotes, or newlines are wrapped in double quotes.
 * Double quotes within values are escaped by doubling them.
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (!rows || rows.length === 0) return ''

  const keys = columns ?? Object.keys(rows[0])

  const escape = (value: string | number): string => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = keys.join(',')
  const body = rows
    .map((row) => keys.map((key) => escape(row[key])).join(','))
    .join('\n')

  return `${header}\n${body}`
}