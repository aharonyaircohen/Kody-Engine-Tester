/**
 * Config validator module — validates configuration objects and returns
 * {@link Result} for explicit error handling, consistent with @/utils/result.
 *
 * @example
 * ```ts
 * const result = validate(config, {
 *   port: ConfigValidators.required<number>(),
 *   env:  ConfigValidators.enumValue(['dev', 'prod'] as const),
 * })
 * result.match({
 *   ok:    (cfg) => startServer(cfg),
 *   err:   (e)   => console.error(e),
 * })
 * ```
 */

import { ok, err } from './result'
import type { Result } from './result'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export type ValidationRule<T = unknown> =
  | RequiredRule<T>
  | MinLengthRule
  | MaxLengthRule
  | MinRule
  | MaxRule
  | EnumRule
  | CustomRule<T>

export interface RequiredRule<T> {
  kind: 'required'
  validate: (value: unknown) => value is T
}

export interface MinLengthRule {
  kind: 'minLength'
  minLength: number
}

export interface MaxLengthRule {
  kind: 'maxLength'
  maxLength: number
}

export interface MinRule {
  kind: 'min'
  min: number
}

export interface MaxRule {
  kind: 'max'
  max: number
}

export interface EnumRule {
  kind: 'enum'
  allowed: readonly unknown[]
}

export interface CustomRule<T> {
  kind: 'custom'
  validate: (value: T) => boolean
  message: string
}

// ---------------------------------------------------------------------------
// Rule factories
// ---------------------------------------------------------------------------

/** Marks a field as required — rejects `null` and `undefined`. */
export function required<T>(): RequiredRule<T> {
  return {
    kind: 'required',
    validate: (v): v is T => v !== null && v !== undefined,
  }
}

/** Enforces a minimum string / array length. */
export function minLength(min: number): MinLengthRule {
  return { kind: 'minLength', minLength: min }
}

/** Enforces a maximum string / array length. */
export function maxLength(max: number): MaxLengthRule {
  return { kind: 'maxLength', maxLength: max }
}

/** Enforces a minimum numeric value. */
export function min(min: number): MinRule {
  return { kind: 'min', min }
}

/** Enforces a maximum numeric value. */
export function max(max: number): MaxRule {
  return { kind: 'max', max }
}

/** Enforces that a value is one of the allowed enum values. */
export function enumValue<T extends readonly unknown[]>(allowed: T): EnumRule {
  return { kind: 'enum', allowed }
}

/** Attaches a custom predicate with a descriptive error message. */
export function custom<T>(predicate: (value: T) => boolean, message: string): CustomRule<T> {
  return { kind: 'custom', validate: predicate, message }
}

/** Combines multiple rules on a single field into one array. */
export function combine<T>(...rules: ValidationRule<T>[]): ValidationRule<T>[] {
  return rules
}

// ---------------------------------------------------------------------------
// Core validation
// ---------------------------------------------------------------------------

function applyRules(
  field: string,
  value: unknown,
  rules: ValidationRule<unknown>[]
): ValidationError | null {
  for (const rule of rules) {
    switch (rule.kind) {
      case 'required': {
        if (!rule.validate(value)) {
          return { field, message: `"${field}" is required`, value }
        }
        break
      }
      case 'minLength': {
        if (typeof value === 'string' || Array.isArray(value)) {
          if (value.length < rule.minLength) {
            return {
              field,
              message: `"${field}" must be at least ${rule.minLength} characters long`,
              value,
            }
          }
        }
        break
      }
      case 'maxLength': {
        if (typeof value === 'string' || Array.isArray(value)) {
          if (value.length > rule.maxLength) {
            return {
              field,
              message: `"${field}" must be at most ${rule.maxLength} characters long`,
              value,
            }
          }
        }
        break
      }
      case 'min': {
        if (typeof value === 'number') {
          if (value < rule.min) {
            return {
              field,
              message: `"${field}" must be at least ${rule.min}`,
              value,
            }
          }
        }
        break
      }
      case 'max': {
        if (typeof value === 'number') {
          if (value > rule.max) {
            return {
              field,
              message: `"${field}" must be at most ${rule.max}`,
              value,
            }
          }
        }
        break
      }
      case 'enum': {
        if (!rule.allowed.includes(value)) {
          return {
            field,
            message: `"${field}" must be one of: ${rule.allowed.join(', ')}`,
            value,
          }
        }
        break
      }
      case 'custom': {
        if (!rule.validate(value)) {
          return { field, message: `"${field}" ${rule.message}`, value }
        }
        break
      }
    }
  }
  return null
}

/**
 * Validates `config` against `rules` and returns a `Result` that aggregates **all**
 * field errors before returning.
 *
 * @example
 * ```ts
 * const result = validate(config, {
 *   port: ConfigValidators.required<number>(),
 *   env:  ConfigValidators.enumValue(['dev', 'prod'] as const),
 * })
 * ```
 */
export function validate<T extends Record<string, unknown>>(
  config: T,
  rules: Partial<Record<keyof T, ValidationRule<unknown> | ValidationRule<unknown>[]>>
): Result<T, ValidationError[]> {
  const errors: ValidationError[] = []

  for (const [field, fieldRules] of Object.entries(rules)) {
    const ruleset = Array.isArray(fieldRules)
      ? fieldRules
      : fieldRules
        ? [fieldRules]
        : []
    const value = config[field as keyof T]
    const error = applyRules(field, value, ruleset)
    if (error) errors.push(error)
  }

  if (errors.length > 0) return err(errors)
  return ok(config)
}

/**
 * Validates `config` against `rules` and returns a `Result` that resolves to the
 * **first** validation error encountered.
 */
export function validateOne<T extends Record<string, unknown>>(
  config: T,
  rules: Partial<Record<keyof T, ValidationRule<unknown> | ValidationRule<unknown>[]>>
): Result<T, ValidationError> {
  for (const [field, fieldRules] of Object.entries(rules)) {
    const ruleset = Array.isArray(fieldRules)
      ? fieldRules
      : fieldRules
        ? [fieldRules]
        : []
    const value = config[field as keyof T]
    const error = applyRules(field, value, ruleset)
    if (error) return err(error)
  }
  return ok(config)
}

// ---------------------------------------------------------------------------
// Named export group (mirrors ConfigValidators pattern from debounce/retry)
// ---------------------------------------------------------------------------

export const ConfigValidators = {
  required,
  minLength,
  maxLength,
  min,
  max,
  enumValue,
  custom,
  combine,
} as const
