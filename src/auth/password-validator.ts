export interface PasswordStrengthResult {
  valid: boolean
  issues: string[]
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const issues: string[] = []

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long')
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
