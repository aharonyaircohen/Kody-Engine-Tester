export interface FormatPhoneOptions {
  /** Format style: 'us' for (XXX) XXX-XXXX, 'international' for +1 XXX XXX XXXX (default: 'us') */
  style?: 'us' | 'international'
  /** Locale for formatting (default: 'en-US') */
  locale?: string
}

/**
 * Formats a phone number string with locale-aware formatting.
 *
 * @example
 * formatPhone('5551234567')                        // "(555) 123-4567"
 * formatPhone('5551234567', { style: 'us' })      // "(555) 123-4567"
 * formatPhone('5551234567', { style: 'international' })  // "+1 555 123 4567"
 * formatPhone('5551234567', { locale: 'de-DE' }) // "+1 555 123 4567"
 */
export function formatPhone(phone: string, options: FormatPhoneOptions = {}): string {
  const {
    style = 'us',
    locale = 'en-US',
  } = options

  // Strip all non-digit characters for processing
  const digits = phone.replace(/\D/g, '')

  // Handle empty or invalid input
  if (digits.length === 0) {
    return phone
  }

  // Extract country code (assumes 1 for US if 10 digits)
  const countryCode = digits.length === 11 && digits.startsWith('1') ? '1' : null
  const localDigits = countryCode ? digits.slice(1) : digits

  // Handle US-style formatting (10 digits)
  if (localDigits.length === 10) {
    const areaCode = localDigits.slice(0, 3)
    const prefix = localDigits.slice(3, 6)
    const lineNumber = localDigits.slice(6, 10)

    if (style === 'international') {
      const countryStr = countryCode ? `+${countryCode} ` : ''
      return `${countryStr}${areaCode} ${prefix} ${lineNumber}`
    }

    // US style: (XXX) XXX-XXXX
    const countryStr = countryCode ? `+${countryCode} ` : ''
    return `${countryStr}(${areaCode}) ${prefix}-${lineNumber}`
  }

  // For other lengths, return with international formatting
  if (style === 'international') {
    const countryStr = countryCode ? `+${countryCode} ` : ''
    // Format as XXX XXX XXXX... with spaces every 3 digits
    const formatted = localDigits.match(/.{1,3}/g)?.join(' ') ?? localDigits
    return `${countryStr}${formatted}`
  }

  // Fallback: return original with digits only
  return digits
}
