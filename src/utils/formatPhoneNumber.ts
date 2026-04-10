/**
 * Formats a phone number string into a standardized format.
 * - US numbers: (XXX) XXX-XXXX
 * - International numbers with country code: +1 (XXX) XXX-XXXX
 */

export interface FormatPhoneNumberOptions {
  countryCode?: string
}

export function formatPhoneNumber(
  phone: string,
  options: FormatPhoneNumberOptions = {}
): string {
  if (!phone) {
    return ''
  }

  // Extract all digits
  const digits = phone.replace(/\D/g, '')

  if (!digits.length) {
    return ''
  }

  // Check if the original phone had a + prefix (indicating international intent)
  const hasPlusPrefix = phone.startsWith('+')

  // If options specify a country code, prepend it to the digits
  if (options.countryCode) {
    const ccDigits = options.countryCode.replace(/\D/g, '')
    const combinedDigits = ccDigits + digits
    // Format as international with the specified country code
    if (combinedDigits.length >= 10) {
      const domesticNumber = combinedDigits.slice(-10)
      const countryPrefix = combinedDigits.slice(0, combinedDigits.length - 10)
      const formatted = formatUSPhone(domesticNumber)
      return countryPrefix ? `+${countryPrefix} ${formatted}` : formatted
    }
    return phone
  }

  // Handle US numbers
  if (digits.length === 10) {
    return formatUSPhone(digits)
  }

  if (digits.length === 11 && digits[0] === '1') {
    // 11-digit US number starting with 1: strip leading 1 for domestic formatting
    // UNLESS it had a + prefix (international intent)
    if (hasPlusPrefix) {
      return `+1 ${formatUSPhone(digits.slice(1))}`
    }
    return formatUSPhone(digits.slice(1))
  }

  // Handle international numbers (e.g., +441234567890 for UK)
  // Assume country code is 1-3 digits at the beginning
  // Try longer country codes first to avoid ambiguity (e.g., +44 vs +4)
  if (hasPlusPrefix && digits.length >= 10) {
    for (const cclen of [3, 2, 1]) {
      if (digits.length >= cclen + 10) {
        const possibleCountryCode = digits.slice(0, cclen)
        const possibleNumber = digits.slice(cclen, cclen + 10)
        if (possibleNumber.length === 10) {
          return `+${possibleCountryCode} ${formatUSPhone(possibleNumber)}`
        }
      }
    }
  }

  // Fallback: return digits if too short
  return digits
}

function formatUSPhone(digits: string): string {
  if (digits.length !== 10) {
    return digits
  }
  const areaCode = digits.slice(0, 3)
  const prefix = digits.slice(3, 6)
  const lineNumber = digits.slice(6, 10)
  return `(${areaCode}) ${prefix}-${lineNumber}`
}
