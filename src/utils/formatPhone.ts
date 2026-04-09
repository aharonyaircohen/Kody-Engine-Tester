export interface FormatPhoneOptions {
  /** Format style: 'us' formats as (555) 123-4567, 'intl' formats as +1 555-123-4567 (default: 'us') */
  style?: 'us' | 'intl'
  /** Custom separator between digits (default: '-') */
  separator?: string
  /** Whether to include country code for US numbers (default: false) */
  includeCountryCode?: boolean
}

/**
 * Formats a phone number string into a consistent display format.
 *
 * @example
 * formatPhone('5551234567')                    // "(555) 123-4567"
 * formatPhone('5551234567', { style: 'intl' }) // "+1 555-123-4567"
 * formatPhone('15551234567')                   // "+1 (555) 123-4567"
 * formatPhone('5551234567', { separator: '.' })// "(555) 123.4567"
 */
export function formatPhone(phone: string, options: FormatPhoneOptions = {}): string {
  const {
    style = 'us',
    separator = '-',
    includeCountryCode = false,
  } = options

  // Strip all non-digit characters for processing
  const digits = phone.replace(/\D/g, '')

  // Handle empty or invalid input
  if (!digits) {
    return phone
  }

  // US numbers: 10 digits (or 11 with leading 1)
  if (digits.length === 10) {
    const areaCode = digits.slice(0, 3)
    const prefix = digits.slice(3, 6)
    const lineNumber = digits.slice(6, 10)

    if (style === 'intl' || includeCountryCode) {
      return `+1 (${areaCode}) ${prefix}${separator}${lineNumber}`
    }

    return `(${areaCode}) ${prefix}${separator}${lineNumber}`
  }

  // 11-digit US number with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.slice(1, 4)
    const prefix = digits.slice(4, 7)
    const lineNumber = digits.slice(7, 11)

    return `+1 (${areaCode}) ${prefix}${separator}${lineNumber}`
  }

  // International numbers (more than 11 digits or doesn't start with 1)
  return formatInternational(digits, separator)
}

/**
 * Formats an international phone number.
 */
function formatInternational(digits: string, separator: string): string {
  // Extract country code (1-3 digits)
  const countryCodeLength = digits.length > 10 ? Math.min(3, digits.length - 10) : 1
  const countryCode = digits.slice(0, countryCodeLength)
  const restNumber = digits.slice(countryCodeLength)

  // Format remaining as groups
  if (restNumber.length === 10) {
    const areaCode = restNumber.slice(0, 3)
    const prefix = restNumber.slice(3, 6)
    const lineNumber = restNumber.slice(6, 10)
    return `+${countryCode} (${areaCode}) ${prefix}${separator}${lineNumber}`
  }

  // For other lengths, just group by 3-4 digits
  const groups = restNumber.match(/.{1,4}/g) ?? [restNumber]
  return `+${countryCode} ${groups.join(separator)}`
}