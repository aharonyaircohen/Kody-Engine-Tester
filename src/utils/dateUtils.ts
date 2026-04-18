/**
 * Formats a Date object into a locale-specific string representation.
 *
 * @param date - The Date instance to format
 * @param locale - The IETF BCP 47 locale tag (e.g. 'en-US', 'de-DE', 'fr-FR')
 * @returns A formatted date string, or 'Invalid Date' if the input is not a valid Date
 * @example
 * formatDate(new Date('2024-01-15T10:30:00Z'), 'en-US') // '1/15/2024'
 * formatDate(new Date('2024-01-15T10:30:00Z'), 'de-DE') // '15.1.2024'
 */
export function formatDate(date: Date, locale: string): string {
  if (!isValidDate(date)) {
    return String(date)
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  return formatter.format(date)
}

/**
 * Checks whether a given value is a valid Date instance with a finite time value.
 *
 * @param date - The value to validate
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime())
}
