I now have a thorough understanding of all existing patterns. Let me write the plan.

---

## Implementation Plan: `src/utils/configValidator.ts` with Tests

### Existing Patterns Found

- **`src/utils/result.ts`**: `Result<T, E>` discriminated union (`Ok`/`Err`), `ok()`, `err()`, `tryCatch()` — configValidator returns this type
- **`src/utils/debounce.ts`**: Single-function utility with typed `Options` interface, JSDoc comments, named exports
- **`src/utils/retry.ts`**: Configurable utility with typed options interface and `shouldRetry` callback
- **`debounce.test.ts`**: `describe/it` blocks, `vi.fn()`, `vi.useFakeTimers()`, `beforeEach/afterEach` for timer cleanup
- **`vitest.config.mts`**: `test:int` runs `vitest run --config ./vitest.config.mts`; test includes `src/**/*.test.ts`

---

### Step 1: Write the test file first (TDD)

**File:** `src/utils/configValidator.test.ts`
**Change:** Create the full test suite with `vi.fn()` mocks for Payload SDK and `vi.useFakeTimers()` where applicable
**Why:** Follows TDD — test before implementation; matches existing `debounce.test.ts` pattern exactly
**Verify:** `pnpm test:int 2>&1 | grep "configValidator" | head -20` (tests fail until step 2)

### Step 2: Write the implementation

**File:** `src/utils/configValidator.ts`
**Change:** Create the full module with:
- `ConfigValidatorOptions<T>` interface
- `ValidationRule<T>` union type
- `validate(config, rules)` — returns `Result<ValidConfig<T>, ValidationError[]>` (aggregates all errors via `collect`)
- `validateOne(config, rules)` — returns `Result<ValidConfig<T>, ValidationError>` (first error, convenience wrapper)
- `ConfigValidators` object with named validators: `required`, `string`, `number`, `enumValue`, `minLength`, `maxLength`, `min`, `max`, `custom`
- `ConfigValidators` exposes `combine(...validators)` → `ValidationRule<T>`
**Why:** Matches `debounce.ts` (single-responsibility, typed options, JSDoc), `retry.ts` (configurable options with strategy callback), and `result.ts` (returns `Result<T, E>`)
**Verify:** `pnpm test:int 2>&1 | tail -10` (tests pass)

---

### Complete New Files

#### `src/utils/configValidator.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validate, validateOne, ConfigValidators } from './configValidator'

const mockConfig = { name: 'my-project', port: 3000, env: 'development', tags: ['a', 'b'] }

describe('configValidator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('validate', () => {
    it('returns Ok for a valid config', () => {
      const rules = {
        name: ConfigValidators.required<string>(),
        port: ConfigValidators.required<number>(),
        env: ConfigValidators.enumValue(['development', 'production'] as const),
      }
      const result = validate(mockConfig, rules)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual(mockConfig)
    })

    it('returns Err for a missing required field', () => {
      const rules = { name: ConfigValidators.required<string>() }
      const result = validate({ ...mockConfig, name: undefined as unknown as string }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('name')
        expect(result.error[0].message).toContain('required')
      }
    })

    it('returns Err for a string shorter than minLength', () => {
      const rules = { name: ConfigValidators.minLength<string>(5) }
      const result = validate({ name: 'ab' }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('name')
        expect(result.error[0].message).toContain('minLength')
      }
    })

    it('returns Err for a string longer than maxLength', () => {
      const rules = { name: ConfigValidators.maxLength<string>(3) }
      const result = validate({ name: 'toolong' }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('name')
        expect(result.error[0].message).toContain('maxLength')
      }
    })

    it('returns Err for a number below min', () => {
      const rules = { port: ConfigValidators.min<number>(1000) }
      const result = validate({ port: 80 }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('port')
        expect(result.error[0].message).toContain('min')
      }
    })

    it('returns Err for a number above max', () => {
      const rules = { port: ConfigValidators.max<number>(4000) }
      const result = validate({ port: 9999 }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('port')
        expect(result.error[0].message).toContain('max')
      }
    })

    it('returns Err for a value not in enum', () => {
      const rules = { env: ConfigValidators.enumValue(['development', 'production'] as const) }
      const result = validate({ env: 'staging' }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('env')
        expect(result.error[0].message).toContain('enum')
      }
    })

    it('collects multiple field errors', () => {
      const rules = {
        name: ConfigValidators.required<string>(),
        port: ConfigValidators.min<number>(1000),
        env: ConfigValidators.enumValue(['development', 'production'] as const),
      }
      const badConfig = { name: '', port: 80, env: 'staging' }
      const result = validate(badConfig, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('supports combine to chain multiple validators on one field', () => {
      const rules = {
        name: ConfigValidators.combine(
          ConfigValidators.required<string>(),
          ConfigValidators.minLength<string>(3),
          ConfigValidators.maxLength<string>(20)
        ),
      }
      // too short
      const r1 = validate({ name: 'ab' }, rules)
      expect(r1.isErr()).toBe(true)
      // valid
      const r2 = validate({ name: 'validname' }, rules)
      expect(r2.isOk()).toBe(true)
    })

    it('supports custom validator', () => {
      const isPositive = ConfigValidators.custom<number>((v) => v > 0, 'must be positive')
      const result = validate({ value: -5 }, { value: isPositive })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].message).toContain('must be positive')
      }
    })

    it('skips validation when value is undefined and no required rule', () => {
      const rules = { optional: ConfigValidators.minLength<string>(3) }
      const result = validate({ optional: undefined }, rules)
      // non-required, undefined is skipped
      expect(result.isOk()).toBe(true)
    })
  })

  describe('validateOne', () => {
    it('returns Ok for a valid config', () => {
      const rules = { name: ConfigValidators.required<string>() }
      const result = validateOne({ name: 'test' }, rules)
      expect(result.isOk()).toBe(true)
    })

    it('returns Err with the first error only', () => {
      const rules = {
        name: ConfigValidators.minLength<string>(5),
        port: ConfigValidators.min<number>(1000),
      }
      const result = validateOne({ name: 'ab', port: 80 }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.field).toBe('name')
        expect(result.error.message).toContain('minLength')
      }
    })
  })

  describe('map / mapErr / unwrapOr on result', () => {
    it('allows chaining with map', () => {
      const rules = { name: ConfigValidators.required<string>() }
      const result = validate({ name: 'hello' }, rules)
      const mapped = result.map((c) => c.name.toUpperCase())
      expect(mapped.isOk()).toBe(true)
      if (mapped.isOk()) expect(mapped.value).toBe('HELLO')
    })

    it('allows unwrapOr fallback', () => {
      const rules = { name: ConfigValidators.required<string>() }
      const result = validate({ name: undefined as unknown as string }, rules)
      expect(result.unwrapOr({ name: 'default' })).toEqual({ name: 'default' })
    })
  })
})
```

#### `src/utils/configValidator.ts`

```typescript
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

import type { Result } from './result'
import { ok, err, tryCatch } from './result'

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

export interface ConfigValidatorOptions<T = unknown> {
  field: string
  rules: ValidationRule<T>[]
}

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
export function enumValue<T extends readonly unknown[]>(
  allowed: T
): EnumRule {
  return { kind: 'enum', allowed }
}

/** Attaches a custom predicate with a descriptive error message. */
export function custom<T>(
  predicate: (value: T) => boolean,
  message: string
): CustomRule<T> {
  return { kind: 'custom', validate: predicate, message }
}

/** Combines multiple rules on a single field into one. */
export function combine<T>(...rules: ValidationRule<T>[]): ValidationRule<T>[] {
  return rules
}

// ---------------------------------------------------------------------------
// Core validation
// ---------------------------------------------------------------------------

function applyRules<T extends Record<string, unknown>>(
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
    const ruleset = Array.isArray(fieldRules) ? fieldRules : fieldRules ? [fieldRules] : []
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
    const ruleset = Array.isArray(fieldRules) ? fieldRules : fieldRules ? [fieldRules] : []
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
```

---

## Questions

No questions — all decisions follow directly from the existing patterns found in `src/utils/`.