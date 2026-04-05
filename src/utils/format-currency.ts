export interface FormatCurrencyOptions {
  /** ISO 4217 currency code (default: 'USD') */
  currency?: string
  /** Locale for formatting (default: 'en-US') */
  locale?: string
  /** Whether to show currency symbol (default: true) */
  showCurrencySymbol?: boolean
  /** Whether to use currency code vs symbol (default: false, uses symbol) */
  useCurrencyCode?: boolean
}

/**
 * Formats a number as a currency string with locale-aware formatting.
 *
 * @example
 * formatCurrency(1234.56)                    // "$1,234.56"
 * formatCurrency(1234.56, { currency: 'EUR' })  // "€1,234.56"
 * formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' })  // "1.234,56 €"
 * formatCurrency(1234.56, { useCurrencyCode: true })  // "USD 1,234.56"
 */
export function formatCurrency(n: number, options: FormatCurrencyOptions = {}): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showCurrencySymbol = true,
    useCurrencyCode = false,
  } = options

  // Handle invalid input
  if (!Number.isFinite(n)) {
    return String(n)
  }

  // Use Intl.NumberFormat for proper locale-aware currency formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatted = formatter.format(n)

  // If not showing currency symbol, strip it and return just the number
  if (!showCurrencySymbol) {
    return stripCurrencySymbol(formatted, currency, locale)
  }

  // If using currency code instead of symbol, replace symbol with code
  if (useCurrencyCode) {
    const symbol = getCurrencySymbol(currency, locale)
    return formatted.replace(symbol, `${currency} `)
  }

  return formatted
}

/**
 * Gets the currency symbol for a given currency code and locale.
 */
function getCurrencySymbol(currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  })
  const parts = formatter.formatToParts(0)
  const symbolPart = parts.find(p => p.type === 'currency')
  return symbolPart?.value ?? currency
}

/**
 * Strips the currency symbol from a formatted currency string.
 */
function stripCurrencySymbol(formatted: string, currency: string, locale: string): string {
  const symbol = getCurrencySymbol(currency, locale)
  return formatted.replace(symbol, '').trim()
}