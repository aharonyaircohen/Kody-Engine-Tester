import type { Validator } from './validators'

export function compose<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const validator of validators) {
      const result = validator(value)
      if (!result.valid) return result
    }
    return { valid: true }
  }
}

export function composeWithSkip<T>(skippedBranches: string[], ...validators: Validator<T>[]): Validator<T> {
  const skipSet = new Set(skippedBranches)
  return (value: T) => {
    if (skipSet.has(String(value))) return { valid: true }
    return compose(...validators)(value)
  }
}
