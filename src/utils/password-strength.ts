export type PasswordStrength = 'weak' | 'medium' | 'strong'

function calculateEntropy(password: string): number {
  let charsetSize = 0
  if (/[a-z]/.test(password)) charsetSize += 26
  if (/[A-Z]/.test(password)) charsetSize += 26
  if (/[0-9]/.test(password)) charsetSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32

  if (charsetSize === 0) return 0
  return password.length * Math.log2(charsetSize)
}

export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number
  entropy: number
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const entropy = calculateEntropy(password)

  if (password.length === 0) {
    return { strength: 'weak', score: 0, entropy: 0 }
  }

  let score = 0

  // Length scoring
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  // Entropy bonus
  if (entropy >= 40) score += 1
  if (entropy >= 60) score += 1
  if (entropy >= 80) score += 1

  let strength: PasswordStrength
  if (score < 5) {
    strength = 'weak'
  } else if (score < 9) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return { strength, score, entropy: Math.round(entropy) }
}
