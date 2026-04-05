export type DateFormatType = 'iso' | 'relative' | 'locale'

export interface FormatDateOptions {
  /** Format type: 'iso' uses toISOString(), 'relative' uses Intl.RelativeTimeFormat, 'locale' uses Intl.DateTimeFormat (default: 'locale') */
  format?: DateFormatType
  /** Locale for formatting (default: 'en-US') */
  locale?: string
  /** Relative time style: 'long', 'short', or 'narrow' (default: 'long') */
  relativeStyle?: 'long' | 'short' | 'narrow'
  /** Custom locale options for DateTimeFormat */
  localeOptions?: Intl.DateTimeFormatOptions
  /** Reference date for relative formatting (defaults to now) */
  referenceDate?: Date
}

/**
 * Formats a date using the specified format type.
 *
 * @example
 * formatDate(new Date('2024-01-15T10:30:00Z'))        // "1/15/2024" (locale default)
 * formatDate(new Date('2024-01-15T10:30:00Z'), { format: 'iso' })  // "2024-01-15T10:30:00.000Z"
 * formatDate(new Date(), { format: 'relative' })      // "2 hours ago" (or similar)
 * formatDate(new Date('2024-01-15T10:30:00Z'), { locale: 'de-DE' }) // "15.1.2024"
 */
export function formatDate(date: Date, options: FormatDateOptions = {}): string {
  const {
    format = 'locale',
    locale = 'en-US',
    relativeStyle = 'long',
    localeOptions,
    referenceDate = new Date(),
  } = options

  // Handle invalid date
  if (!isValidDate(date)) {
    return String(date)
  }

  switch (format) {
    case 'iso':
      return date.toISOString()

    case 'relative':
      return formatRelative(date, referenceDate, locale, relativeStyle)

    case 'locale':
    default:
      return formatLocale(date, locale, localeOptions)
  }
}

/**
 * Checks if a date is valid.
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

/**
 * Formats a date as relative time (e.g. "2 hours ago").
 */
function formatRelative(
  date: Date,
  referenceDate: Date,
  locale: string,
  style: 'long' | 'short' | 'narrow',
): string {
  const diffMs = date.getTime() - referenceDate.getTime()
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffSeconds / 60)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)
  const diffYears = Math.round(diffDays / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { style })

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, 'second')
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day')
  }
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, 'week')
  }
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, 'month')
  }
  return rtf.format(diffYears, 'year')
}

/**
 * Formats a date using Intl.DateTimeFormat.
 */
function formatLocale(
  date: Date,
  locale: string,
  customOptions?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }
  const formatter = new Intl.DateTimeFormat(locale, customOptions ?? defaultOptions)
  return formatter.format(date)
}