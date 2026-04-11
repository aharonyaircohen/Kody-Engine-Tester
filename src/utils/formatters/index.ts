/**
 * String formatting utilities for common data types.
 */

/**
 * Formats a 10-digit phone number as `(XXX) XXX-XXXX`.
 * Handles edge cases for short numbers (returns as-is) and long numbers
 * (truncates to 10 digits before formatting).
 *
 * @example
 * formatPhoneNumber('1234567890')  // "(123) 456-7890"
 * formatPhoneNumber('123')         // "123"
 * formatPhoneNumber('12345678901234')  // "(123) 456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length < 10) {
    return phone
  }

  const normalized = digits.slice(0, 10)
  const areaCode = normalized.slice(0, 3)
  const prefix = normalized.slice(3, 6)
  const lineNumber = normalized.slice(6, 10)

  return `(${areaCode}) ${prefix}-${lineNumber}`
}

/**
 * Formats a credit card number, masking all but the last 4 digits.
 * Input can be 1-16 digits; shorter inputs are returned as-is.
 * Output format: `XXXX XXXX XXXX XXXX` (last 4 digits shown).
 *
 * @example
 * formatCreditCard('1234567890123456')  // "**** **** **** 3456"
 * formatCreditCard('1234')              // "1234"
 */
export function formatCreditCard(card: string): string {
  const digits = card.replace(/\D/g, '')

  if (digits.length <= 4) {
    return digits
  }

  const lastFour = digits.slice(-4)
  return `**** **** **** ${lastFour}`
}
