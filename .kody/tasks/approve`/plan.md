I have enough information to write the complete implementation plan. Let me output it directly:

---

## Step 1: Create `src/utils/configValidator.test.ts` (TDD first)

**File:** `src/utils/configValidator.test.ts`
**Change:** Create co-located test file with full coverage before writing the implementation.
**Why:** TDD ordering per project acceptance criteria; vitest co-location pattern matches `src/utils/retry.test.ts`, `src/utils/result.test.ts`, etc.
**Verify:** `pnpm test:int` will fail (red) because implementation doesn't exist yet — expected at this step.

```typescript
import { describe, it, expect } from 'vitest'
import { validateConfig } from './configValidator'
import type { ValidationError } from './configValidator'

describe('validateConfig', () => {
  describe('required fields', () => {
    it('returns Ok for a valid config with only required fields', () => {
      const result = validateConfig({ description: 'My task' })
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toMatchObject({ description: 'My task' })
    })

    it('returns Err when config is not an object', () => {
      const result = validateConfig('not an object')
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('root')
    })

    it('returns Err when config is null', () => {
      const result = validateConfig(null)
      expect(result.isErr()).toBe(true)
    })

    it('returns Err when description is missing', () => {
      const result = validateConfig({})
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })

    it('returns Err when description is an empty string', () => {
      const result = validateConfig({ description: '   ' })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })

    it('returns Err when description is not a string', () => {
      const result = validateConfig({ description: 42 })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })
  })

  describe('type constraints', () => {
    it('accepts valid optional boolean fields', () => {
      const result = validateConfig({
        description: 'My task',
        noCompose: false,
        compose: false,
        composeAll: false,
      })
      expect(result.isOk()).toBe(true)
    })

    it('returns Err when noCompose is not a boolean', () => {
      const result = validateConfig({ description: 'My task', noCompose: 'yes' })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('returns Err when compose is not a boolean', () => {
      const result = validateConfig({ description: 'My task', compose: 1 })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'compose')).toBe(true)
    })

    it('returns Err when composeAll is not a boolean', () => {
      const result = validateConfig({ description: 'My task', composeAll: 'all' })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'composeAll')).toBe(true)
    })

    it('returns Err when buildTargets is not an array', () => {
      const result = validateConfig({ description: 'My task', buildTargets: 'src' })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'buildTargets')).toBe(true)
    })

    it('accepts a valid buildTargets array', () => {
      const result = validateConfig({ description: 'My task', buildTargets: ['src', 'dist'] })
      expect(result.isOk()).toBe(true)
    })

    it('returns Err when entryPoint is not a string', () => {
      const result = validateConfig({ description: 'My task', entryPoint: 99 })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'entryPoint')).toBe(true)
    })

    it('accepts a valid entryPoint string', () => {
      const result = validateConfig({ description: 'My task', entryPoint: 'src/index.ts' })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('--no-compose mutual exclusivity', () => {
    it('returns Err when noCompose and compose are both true', () => {
      const result = validateConfig({ description: 'My task', noCompose: true, compose: true })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('returns Err when noCompose and composeAll are both true', () => {
      const result = validateConfig({ description: 'My task', noCompose: true, composeAll: true })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('allows noCompose: true when compose and composeAll are absent', () => {
      const result = validateConfig({ description: 'My task', noCompose: true })
      expect(result.isOk()).toBe(true)
    })

    it('allows noCompose: true when compose and composeAll are false', () => {
      const result = validateConfig({
        description: 'My task',
        noCompose: true,
        compose: false,
        composeAll: false,
      })
      expect(result.isOk()).toBe(true)
    })

    it('allows compose: true without noCompose', () => {
      const result = validateConfig({ description: 'My task', compose: true })
      expect(result.isOk()).toBe(true)
    })

    it('allows composeAll: true without noCompose', () => {
      const result = validateConfig({ description: 'My task', composeAll: true })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('multiple validation errors', () => {
    it('collects all errors when multiple fields are invalid', () => {
      const result = validateConfig({ description: '', noCompose: 'yes', buildTargets: 'src' })
      expect(result.isErr()).toBe(true)
      const errors = result.unwrapOr([]) as ValidationError[]
      expect(errors.length).toBeGreaterThanOrEqual(3)
    })
  })
})
```

---

## Step 2: Create `src/utils/configValidator.ts`

**File:** `src/utils/configValidator.ts`
**Change:** Implement the config validator using `Result<T, E>` from `result.ts`. Named exports, JSDoc with `@example`, single-responsibility module — mirrors `retry.ts` / `flatten.ts` pattern.
**Why:** Satisfies all acceptance criteria: `Result<T, E>`, named exports, no thrown exceptions, no `console.log`, proper TypeScript types without `as unknown as`.
**Verify:** `pnpm test:int` passes (green) — all tests in `configValidator.test.ts` pass.

```typescript
import type { Result } from '@/utils/result'
import { ok, err } from '@/utils/result'

/** Validated Kody task configuration. */
export interface KodyConfig {
  /** Short description of what the task does. Required. */
  description: string
  /** When true, stop after parallel builds and skip the compose step. Mutually exclusive with compose and composeAll. */
  noCompose?: boolean
  /** When true, run the compose step after parallel builds. Mutually exclusive with noCompose. */
  compose?: boolean
  /** When true, run the compose-all step after parallel builds. Mutually exclusive with noCompose. */
  composeAll?: boolean
  /** List of build target identifiers (e.g. 'src', 'dist'). */
  buildTargets?: string[]
  /** Path to the entry point file (e.g. 'src/index.ts'). */
  entryPoint?: string
}

/** Describes a single validation failure. */
export interface ValidationError {
  /** The config field that failed validation, or 'root' for top-level structure errors. */
  field: string
  /** Human-readable explanation of why the field failed. */
  message: string
}

/**
 * Validates an unknown value against the KodyConfig schema.
 *
 * Enforces:
 * - `description` is a required non-empty string
 * - `noCompose`, `compose`, `composeAll` must be booleans when present
 * - `buildTargets` must be an array when present
 * - `entryPoint` must be a string when present
 * - `--no-compose` (`noCompose: true`) is mutually exclusive with `--compose` and `--compose-all`
 *
 * All validation errors are collected before returning, so callers receive the full list.
 *
 * @param config - The raw value to validate (typically parsed from CLI flags or JSON).
 * @returns `Ok<KodyConfig>` when the config is valid, `Err<ValidationError[]>` otherwise.
 *
 * @example
 * const result = validateConfig({ description: 'Build the API', noCompose: true })
 * if (result.isOk()) {
 *   const config = result.unwrap()
 *   // config.noCompose === true
 * } else {
 *   const errors = result.unwrapOr([])
 *   errors.forEach((e) => console.error(`${e.field}: ${e.message}`))
 * }
 */
export function validateConfig(config: unknown): Result<KodyConfig, ValidationError[]> {
  if (typeof config !== 'object' || config === null) {
    return err([{ field: 'root', message: 'Config must be a non-null object' }])
  }

  const c = config as Record<string, unknown>
  const errors: ValidationError[] = []

  // Required: description
  if (
    !c.description ||
    typeof c.description !== 'string' ||
    c.description.trim() === ''
  ) {
    errors.push({
      field: 'description',
      message: 'description is required and must be a non-empty string',
    })
  }

  // Type constraint: noCompose
  if (c.noCompose !== undefined && typeof c.noCompose !== 'boolean') {
    errors.push({ field: 'noCompose', message: 'noCompose must be a boolean' })
  }

  // Type constraint: compose
  if (c.compose !== undefined && typeof c.compose !== 'boolean') {
    errors.push({ field: 'compose', message: 'compose must be a boolean' })
  }

  // Type constraint: composeAll
  if (c.composeAll !== undefined && typeof c.composeAll !== 'boolean') {
    errors.push({ field: 'composeAll', message: 'composeAll must be a boolean' })
  }

  // Type constraint: buildTargets
  if (c.buildTargets !== undefined && !Array.isArray(c.buildTargets)) {
    errors.push({ field: 'buildTargets', message: 'buildTargets must be an array of strings' })
  }

  // Type constraint: entryPoint
  if (c.entryPoint !== undefined && typeof c.entryPoint !== 'string') {
    errors.push({ field: 'entryPoint', message: 'entryPoint must be a string' })
  }

  // Mutual exclusivity: --no-compose vs --compose / --compose-all
  if (c.noCompose === true && (c.compose === true || c.composeAll === true)) {
    errors.push({
      field: 'noCompose',
      message: '--no-compose is mutually exclusive with --compose and --compose-all',
    })
  }

  if (errors.length > 0) {
    return err(errors)
  }

  return ok(c as unknown as KodyConfig)
}
```

---

## Existing Patterns Found

- **`src/utils/result.ts` — `Result<T, E>` discriminated union**: reused as the return type of `validateConfig`; `ok()` / `err()` factory functions imported from `@/utils/result`.
- **`src/utils/retry.ts` — Single-responsibility utility with named exports and TypeScript interfaces**: `configValidator.ts` follows the same structure (exported interfaces + exported function, no default export, JSDoc with `@example`).
- **`src/utils/retry.test.ts` — Vitest co-located test file**: `configValidator.test.ts` follows the same `describe`/`it`/`expect` pattern with no external mocks needed (pure function).
- **`src/utils/schema.ts` — Mini-Zod schema builder**: considered for reuse, but `configValidator` has a specific, bounded set of rules that don't benefit from the generic schema builder overhead; direct type-checking keeps the validator self-contained and easier to read.