/**
 * Formats a Date object into a locale-aware string using Intl.DateTimeFormat.
 * @param date - The Date object to format
 * @param locale - The locale string (e.g. 'en-US', 'de-DE', 'he-IL')
 * @returns A formatted date string based on the provided locale
 */
export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
