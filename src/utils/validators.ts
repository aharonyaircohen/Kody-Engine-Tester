/**
 * Input validation utilities for email, URL, and password validation.
 */

/**
 * Validates an email address using a regex-based approach.
 * - Must have local part followed by @ and domain
 * - Local part: alphanumeric, dots, underscores, hyphens, plus signs
 * - Domain: alphanumeric with dots separating labels
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validates a URL using a regex-based approach.
 * - Supports http and https protocols
 * - Domain must have at least one dot
 * - Optional path, query string, and fragment
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  const urlRegex = /^https?:\/\/[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)+(?:\/[^\s]*)?(?:\?[^#\s]*)?(?:#[^\s]*)?$/
  return urlRegex.test(url)
}

/**
 * Validates password strength.
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function isStrongPassword(password: string): { valid: boolean; reasons: string[] } {
  const reasons: string[] = []

  if (!password || typeof password !== 'string') {
    return { valid: false, reasons: ['Password is required'] }
  }

  if (password.length < 8) {
    reasons.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    reasons.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    reasons.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    reasons.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?-]/.test(password)) {
    reasons.push('Password must contain at least one special character')
  }

  return { valid: reasons.length === 0, reasons }
}
