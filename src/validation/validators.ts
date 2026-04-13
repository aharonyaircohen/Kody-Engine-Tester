export type ValidatorResult = { valid: true } | { valid: false; error: string }
export type Validator<T> = (value: T) => ValidatorResult

export const required = (): Validator<unknown> => (value) =>
  value !== undefined && value !== null && String(value).trim() !== ''
    ? { valid: true }
    : { valid: false, error: 'This field is required' }

export const minLength = (n: number): Validator<string> => (value) =>
  String(value).length >= n
    ? { valid: true }
    : { valid: false, error: `Must be at least ${n} characters` }

export const maxLength = (n: number): Validator<string> => (value) =>
  String(value).length <= n
    ? { valid: true }
    : { valid: false, error: `Must be at most ${n} characters` }

export const pattern = (regex: RegExp, message: string): Validator<string> => (value) => {
  const str = String(value)
  return str === '' || regex.test(str)
    ? { valid: true }
    : { valid: false, error: message }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email = (): Validator<string> => (value) => {
  const str = String(value)
  return str === '' || EMAIL_REGEX.test(str)
    ? { valid: true }
    : { valid: false, error: 'Invalid email address' }
}

export const min = (n: number): Validator<number> => (value) =>
  Number(value) >= n
    ? { valid: true }
    : { valid: false, error: `Must be at least ${n}` }

export const max = (n: number): Validator<number> => (value) =>
  Number(value) <= n
    ? { valid: true }
    : { valid: false, error: `Must be at most ${n}` }

export const oneOf = <T>(
  values: T[],
  message?: string,
): Validator<T> => (value) =>
  values.includes(value)
    ? { valid: true }
    : { valid: false, error: message ?? `Must be one of: ${values.join(', ')}` }

export const passwordStrength = (): Validator<string> => (value) => {
  const str = String(value)
  if (str.length < 8) return { valid: false, error: 'Password must be at least 8 characters' }
  if (!/[A-Z]/.test(str)) return { valid: false, error: 'Password must contain at least one uppercase letter' }
  if (!/[0-9]/.test(str)) return { valid: false, error: 'Password must contain at least one number' }
  if (!/[^A-Za-z0-9]/.test(str)) return { valid: false, error: 'Password must contain at least one special character' }
  return { valid: true }
}

export const confirmPassword = (originalPassword: string): Validator<string> => (value) =>
  value === originalPassword
    ? { valid: true }
    : { valid: false, error: 'Passwords do not match' }
