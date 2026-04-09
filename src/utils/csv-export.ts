/**
 * Escapes a CSV field value by wrapping it in double quotes if necessary.
 * Values containing commas, double quotes, or newlines are wrapped and internal
 * double quotes are escaped by doubling them.
 * @param value - The string or number value to escape
 * @returns The escaped CSV field value
 */
function escapeCsvValue(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts an array of objects to a CSV-formatted string.
 * @param rows - Array of objects with string or number values
 * @param columns - Optional array of column keys to include in order; defaults to all keys from the first row
 * @returns A CSV-formatted string with headers and rows
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (rows.length === 0) {
    return ''
  }

  const keys = columns ?? Object.keys(rows[0])
  const header = keys.join(',')

  const body = rows
    .map((row) =>
      keys
        .map((key) => escapeCsvValue(row[key] ?? ''))
        .join(',')
    )
    .join('\n')

  return `${header}\n${body}`
}