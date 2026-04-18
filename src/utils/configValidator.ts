import { Result, ok, err } from './result'

/**
 * A single validation error for one field in a config object.
 */
export class ValidationError {
  constructor(
    public readonly field: string,
    public readonly message: string,
  ) {}
}

/**
 * A field validator that returns a Result so callers can collect all errors
 * before surfacing them, rather than failing on the first problem.
 */
export type FieldValidator<T> = (value: unknown, field: string) => Result<T, ValidationError>

// Primitives

export const string: FieldValidator<string> = (value, field) => {
  if (typeof value === 'string') return ok(value)
  return err(new ValidationError(field, `Expected string but received ${typeof value}`))
}

export const number: FieldValidator<number> = (value, field) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return ok(value)
  if (typeof value === 'number' && Number.isNaN(value)) {
    return err(new ValidationError(field, `Expected number but received NaN`))
  }
  return err(new ValidationError(field, `Expected number but received ${typeof value}`))
}

export const boolean: FieldValidator<boolean> = (value, field) => {
  if (typeof value === 'boolean') return ok(value)
  return err(new ValidationError(field, `Expected boolean but received ${typeof value}`))
}

export const array: FieldValidator<unknown[]> = (value, field) => {
  if (Array.isArray(value)) return ok(value)
  return err(new ValidationError(field, `Expected array but received ${typeof value}`))
}

// Optional modifier — wraps any FieldValidator and tolerates undefined / null
export const optional = <T>(validator: FieldValidator<T>): FieldValidator<T | undefined> => {
  return (value, field) => {
    if (value === undefined || value === null) return ok(undefined)
    return validator(value, field)
  }
}

// Array of a specific validator — returns individual ValidationErrors per failed item
export const arrayOf = <T>(itemValidator: FieldValidator<T>): (value: unknown, field: string) => Result<T[], ValidationError[]> => {
  return (value, field) => {
    if (!Array.isArray(value)) {
      return err([new ValidationError(field, `Expected array but received ${typeof value}`)])
    }
    const errors: ValidationError[] = []
    const validated: T[] = []
    for (let i = 0; i < value.length; i++) {
      const result = itemValidator(value[i], `${field}[${i}]`)
      if (result.isOk()) {
        validated.push(result.value)
      } else {
        errors.push(result.error)
      }
    }
    if (errors.length > 0) return err(errors)
    return ok(validated)
  }
}

/**
 * Schema entry — pairs a field name with its validator.
 */
export type SchemaEntry = {
  readonly key: string
  readonly validator: FieldValidator<unknown>
}

/**
 * ConfigSchema maps field names to their FieldValidator.
 */
export type ConfigSchema = {
  readonly [field: string]: FieldValidator<unknown>
}

/**
 * Result of validating an entire config object.
 * On success the validated fields are returned as a flat record.
 * On failure a list of all ValidationErrors is attached.
 */
export type ConfigValidationResult<T = Record<string, unknown>> = Result<T, readonly ValidationError[]>

/**
 * Validates a plain config object against a ConfigSchema.
 *
 * All fields are validated and every error is collected before returning,
 * so callers can report all problems at once rather than one at a time.
 *
 * @param schema  Record mapping field names to FieldValidator functions.
 * @param data   The raw config object to validate.
 * @returns      ConfigValidationResult — ok with a typed record on success,
 *               err with all errors on failure.
 */
export function validateConfig<T extends ConfigSchema>(
  schema: T,
  data: unknown,
): ConfigValidationResult<{ [K in keyof T]: unknown }> {
  // Top-level type guard
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return err([
      new ValidationError(
        '(root)',
        `Expected object but received ${Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data}`,
      ),
    ])
  }

  const errors: ValidationError[] = []
  const validated: Record<string, unknown> = {}

  for (const key in schema) {
    const validator = schema[key]
    const value = (data as Record<string, unknown>)[key]
    const result = validator(value, key)

    if (result.isOk()) {
      validated[key] = result.value
    } else {
      errors.push(result.error)
    }
  }

  if (errors.length > 0) return err(errors)
  return ok(validated as { [K in keyof T]: unknown })
}
