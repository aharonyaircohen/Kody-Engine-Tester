import type { Validator } from './validators'

export function validateForm<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Validator<T[K]> },
  data: T,
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  for (const key in schema) {
    const result = schema[key](data[key])
    if (!result.valid) errors[key] = result.error
  }
  return { valid: Object.keys(errors).length === 0, errors }
}
