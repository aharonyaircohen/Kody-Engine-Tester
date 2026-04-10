/**
 * Validates password strength requirements.
 *
 * Password must meet all of the following criteria:
 * - At least 8 characters long
 * - Contains at least one uppercase letter (A-Z)
 * - Contains at least one lowercase letter (a-z)
 * - Contains at least one number (0-9)
 */

const MIN_LENGTH = 8

/**
 * Validates password strength and returns a result object indicating
 * whether the password meets all requirements and lists any issues.
 *
 * @param password - The password string to validate
 * @returns An object with `valid` boolean and `issues` array containing all failed requirements
 *
 * @example
 * const result = validatePasswordStrength('MyPass123')
 * // result: { valid: true, issues: [] }
 *
 * @example
 * const result = validatePasswordStrength('weak')
 * // result: { valid: false, issues: ['Password must be at least 8 characters', 'Password must contain at least one uppercase letter', 'Password must contain at least one number'] }
 */
export function validatePasswordStrength(password: string): { valid: boolean; issues: string[] } {
  if (typeof password !== 'string') {
    return { valid: false, issues: ['Password must be a string'] }
  }

  const issues: string[] = []

  if (password.length < MIN_LENGTH) {
    issues.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number')
  }

  return { valid: issues.length === 0, issues }
}