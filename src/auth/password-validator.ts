export interface PasswordStrengthResult {
  valid: boolean
  issues: string[]
}

const MIN_LENGTH = 8

export function validatePasswordStrength(password: string): PasswordStrengthResult {
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

  return {
    valid: issues.length === 0,
    issues,
  }
}
