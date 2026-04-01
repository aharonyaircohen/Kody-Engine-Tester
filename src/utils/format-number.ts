export interface FormatNumberOptions {
  /** Number of decimal places (default: 2) */
  decimals?: number
  /** Locale for formatting (default: 'en-US') */
  locale?: string
  /** Custom thousands separator (overrides locale) */
  thousandsSeparator?: string
  /** Custom decimal separator (overrides locale) */
  decimalSeparator?: string
}

/**
 * Formats a number with locale-aware thousands separators and configurable decimal places.
 *
 * @example
 * formatNumber(1234567.89)           // "1,234,567.89"
 * formatNumber(1234567.89, { decimals: 0 })  // "1,234,567"
 * formatNumber(1234567.89, { locale: 'de-DE' })  // "1.234.567,89"
 * formatNumber(1234567.89, { thousandsSeparator: ' ' })  // "1 234 567.89"
 */
export function formatNumber(n: number, options: FormatNumberOptions = {}): string {
  const {
    decimals = 2,
    locale = 'en-US',
    thousandsSeparator,
    decimalSeparator,
  } = options

  // Handle invalid input
  if (!Number.isFinite(n)) {
    return String(n)
  }

  // Determine separators based on locale or custom overrides
  const defaultSeparators = getLocaleSeparators(locale)
  const thouSep = thousandsSeparator ?? defaultSeparators.thousands
  const decSep = decimalSeparator ?? defaultSeparators.decimal

  // Split into integer and decimal parts
  const fixed = n.toFixed(decimals)
  const [intPart, decPart = ''] = fixed.split('.')

  // Add thousands separators to integer part
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thouSep)

  // Combine with decimal part if decimals > 0
  if (decimals > 0) {
    return `${formattedInt}${decSep}${decPart}`
  }

  return formattedInt
}

/**
 * Gets the default thousands and decimal separators for a given locale.
 */
function getLocaleSeparators(locale: string): { thousands: string; decimal: string } {
  const formatter = new Intl.NumberFormat(locale)
  const parts = formatter.formatToParts(1234567.89)

  const thousands = parts.find(p => p.type === 'group')?.value ?? ','
  const decimal = parts.find(p => p.type === 'decimal')?.value ?? '.'

  return { thousands, decimal }
}
