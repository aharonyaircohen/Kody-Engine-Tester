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
