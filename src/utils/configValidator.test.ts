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
      const badConfig = { ...mockConfig, name: undefined as unknown as string }
      const result = validate(badConfig, rules)
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
        expect(result.error[0].message).toContain('at least 5 characters')
      }
    })

    it('returns Err for a string longer than maxLength', () => {
      const rules = { name: ConfigValidators.maxLength<string>(3) }
      const result = validate({ name: 'toolong' }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('name')
        expect(result.error[0].message).toContain('at most 3 characters')
      }
    })

    it('returns Err for a number below min', () => {
      const rules = { port: ConfigValidators.min<number>(1000) }
      const result = validate({ port: 80 }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('port')
        expect(result.error[0].message).toContain('at least 1000')
      }
    })

    it('returns Err for a number above max', () => {
      const rules = { port: ConfigValidators.max<number>(4000) }
      const result = validate({ port: 9999 }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('port')
        expect(result.error[0].message).toContain('at most 4000')
      }
    })

    it('returns Err for a value not in enum', () => {
      const rules = { env: ConfigValidators.enumValue(['development', 'production'] as const) }
      const result = validate({ env: 'staging' }, rules)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('env')
        expect(result.error[0].message).toContain('must be one of')
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
        expect(result.error.message).toContain('at least 5 characters')
      }
    })
  })

  describe('map / mapErr / unwrapOr on result', () => {
    it('allows chaining with map', () => {
      const rules = { name: ConfigValidators.required<string>() }
      const result = validate({ name: 'hello' }, rules)
      const mapped = result.map((c) => (c as { name: string }).name.toUpperCase())
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
