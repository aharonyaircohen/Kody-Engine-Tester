const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

export interface FormatDateOptions {
  /** Date to format */
  date: Date
  /** Format string: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD MMM YYYY' */
  format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD MMM YYYY'
}

/**
 * Formats a date using standard format strings.
 *
 * @example
 * formatDate(new Date(2026, 3, 3), { format: 'YYYY-MM-DD' })  // "2026-04-03"
 * formatDate(new Date(2026, 3, 3), { format: 'MM/DD/YYYY' })  // "04/03/2026"
 * formatDate(new Date(2026, 3, 3), { format: 'DD MMM YYYY' })  // "03 Apr 2026"
 */
export function formatDate(date: Date, format: FormatDateOptions['format']): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  const pad = (n: number): string => n.toString().padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${pad(month + 1)}-${pad(day)}`
    case 'MM/DD/YYYY':
      return `${pad(month + 1)}/${pad(day)}/${year}`
    case 'DD MMM YYYY':
      return `${pad(day)} ${MONTH_ABBREV[month]} ${year}`
  }
}
