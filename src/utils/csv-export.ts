/**
 * Converts an array of objects to a CSV string.
 * @param rows - Array of objects with string or number values
 * @param columns - Optional array of column names to include in order; defaults to keys of first row
 * @returns CSV formatted string with headers and rows
 */
export function toCsv(
  rows: Record<string, string | number>[],
  columns?: string[],
): string {
  if (rows.length === 0) return ''

  const cols = columns ?? Object.keys(rows[0])
  const escape = (value: string | number): string => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = cols.join(',')
  const dataRows = rows.map((row) => cols.map((col) => escape(row[col] ?? '')).join(','))
  return [header, ...dataRows].join('\n')
}