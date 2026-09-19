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

export const pattern = (regex: RegExp, message: string): Validator<string> => {
  const matcher = new RegExp(regex.source, regex.flags)

  return (value) => {
    const str = String(value)
    if (str === '') return { valid: true }

    matcher.lastIndex = 0
    return matcher.test(str)
      ? { valid: true }
      : { valid: false, error: message }
  }
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
