/**
 * Converts an array of objects to a CSV-formatted string.
 *
 * @example
 * toCsv([{ name: 'John', age: 30 }])  // "name,age\nJohn,30"
 * toCsv([{ name: 'Doe, John', age: 30 }], ['name', 'age'])  // "name,age\n\"Doe, John\",30"
 */
export function toCsv(rows: Record<string, string | number>[], columns?: string[]): string {
  if (rows.length === 0) return ''

  const keys = columns ?? Object.keys(rows[0])

  const header = keys.join(',')
  const body = rows.map((row) =>
    keys.map((key) => formatValue(row[key])).join(','),
  )

  return [header, ...body].join('\n')
}

/**
 * Formats a single value for CSV output, wrapping in quotes if necessary.
 * Values containing commas or double quotes are wrapped in double quotes.
 * Double quotes within values are escaped by doubling them.
 */
function formatValue(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
