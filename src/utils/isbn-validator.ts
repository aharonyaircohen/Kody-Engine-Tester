/**
 * Validates ISBN-10 and ISBN-13 formats with check digit validation.
 *
 * ISBN-10: 10 digits where the last digit can be 'X' (representing 10).
 *          Check digit: sum of (digit × position) for positions 1-10, mod 11 = 0
 *
 * ISBN-13: 13 digits only.
 *          Check digit: alternating multiply by 1 and 3 for first 12 digits,
 *          then check that (10 - (sum mod 10)) mod 10 equals the 13th digit
 */

const ISBN_10_LENGTH = 10
const ISBN_13_LENGTH = 13

function calculateIsbn10CheckDigit(digits: number[]): number {
  const sum = digits.reduce((acc, digit, index) => acc + digit * (index + 1), 0)
  return sum % 11
}

function calculateIsbn13CheckDigit(digits: number[]): number {
  const sum = digits.reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3), 0)
  return (10 - (sum % 10)) % 10
}

/**
 * Validates an ISBN-10 string.
 * - Must be exactly 10 characters
 * - First 9 characters must be digits
 * - Last character must be a digit or 'X' (representing check digit value 10)
 * - Check digit validation: sum of (digit × position) mod 11 must equal 0
 */
export function isValidIsbn10(isbn: string): boolean {
  if (!isbn || typeof isbn !== 'string') return false

  const cleaned = isbn.replace(/[-\s]/g, '').toUpperCase()

  if (cleaned.length !== ISBN_10_LENGTH) return false

  const digits: number[] = []
  for (let i = 0; i < ISBN_10_LENGTH - 1; i++) {
    const char = cleaned[i]
    if (char < '0' || char > '9') return false
    digits.push(parseInt(char, 10))
  }

  const lastChar = cleaned[ISBN_10_LENGTH - 1]
  let checkDigit: number
  if (lastChar >= '0' && lastChar <= '9') {
    checkDigit = parseInt(lastChar, 10)
  } else if (lastChar === 'X') {
    checkDigit = 10
  } else {
    return false
  }
  digits.push(checkDigit)

  return calculateIsbn10CheckDigit(digits) === 0
}

/**
 * Validates an ISBN-13 string.
 * - Must be exactly 13 characters
 * - All characters must be digits
 * - Check digit validation: (10 - (sum of alternating 1/3 weights mod 10)) mod 10 must equal the 13th digit
 */
export function isValidIsbn13(isbn: string): boolean {
  if (!isbn || typeof isbn !== 'string') return false

  const cleaned = isbn.replace(/[-\s]/g, '')

  if (cleaned.length !== ISBN_13_LENGTH) return false

  const digits: number[] = []
  for (let i = 0; i < ISBN_13_LENGTH; i++) {
    const char = cleaned[i]
    if (char < '0' || char > '9') return false
    digits.push(parseInt(char, 10))
  }

  return calculateIsbn13CheckDigit(digits.slice(0, 12)) === digits[ISBN_13_LENGTH - 1]
}

/**
 * Validates an ISBN-10 or ISBN-13 string.
 * Automatically detects the format and validates accordingly.
 */
export function isValidIsbn(isbn: string): boolean {
  if (!isbn || typeof isbn !== 'string') return false

  const cleaned = isbn.replace(/[-\s]/g, '')

  if (cleaned.length === ISBN_10_LENGTH) {
    return isValidIsbn10(isbn)
  } else if (cleaned.length === ISBN_13_LENGTH) {
    return isValidIsbn13(isbn)
  }

  return false
}
