/**
 * Validates password strength requirements.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */

const MIN_LENGTH = 8

/**
 * Validates password strength against security requirements.
 * Returns an object with validity status and list of issues found.
 */
export function validatePasswordStrength(password: string): { valid: boolean; issues: string[] } {
  if (password == null || typeof password !== 'string') {
    return { valid: false, issues: ['Password must be a string'] }
  }

  const issues: string[] = []

  if (password.length < MIN_LENGTH) {
    issues.push(`Password must be at least ${MIN_LENGTH} characters`)
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