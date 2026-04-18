import { describe, it, expect, vi } from 'vitest'
import { compose, composeWithSkip } from './compose'
import { required, minLength, email, min } from './validators'

describe('compose', () => {
  it('returns valid when all validators pass', () => {
    const validator = compose(required(), minLength(5))
    expect(validator('hello world')).toEqual({ valid: true })
  })

  it('returns the first error when a validator fails', () => {
    const validator = compose(required(), minLength(10))
    const result = validator('hi')
    expect(result.valid).toBe(false)
    expect((result as { valid: false; error: string }).error).toBe('Must be at least 10 characters')
  })

  it('stops at the first failing validator', () => {
    const validator = compose(required(), minLength(10), minLength(20))
    const result = validator('hi')
    // should return first error (minLength 10), not minLength 20
    expect((result as { valid: false; error: string }).error).toBe('Must be at least 10 characters')
  })

  it('returns valid for a single validator', () => {
    const validator = compose(required())
    expect(validator('hello')).toEqual({ valid: true })
    expect(validator('')).toEqual({ valid: false, error: 'This field is required' })
  })

  it('returns valid with no validators (empty compose)', () => {
    const validator = compose()
    expect(validator('anything')).toEqual({ valid: true })
    expect(validator('')).toEqual({ valid: true })
  })

  it('works with email and required', () => {
    const validator = compose(required(), email())
    expect(validator('test@example.com')).toEqual({ valid: true })
    expect(validator('notanemail')).toEqual({ valid: false, error: 'Invalid email address' })
    expect(validator('')).toEqual({ valid: false, error: 'This field is required' })
  })

  it('works with number validators', () => {
    const validator = compose(min(5), min(10))
    expect(validator(15)).toEqual({ valid: true })
    expect(validator(3)).toEqual({ valid: false, error: 'Must be at least 5' })
  })
})

describe('composeWithSkip', () => {
  it('returns valid when skippedBranches is empty and all validators pass', () => {
    const validator = composeWithSkip([], required(), minLength(5))
    expect(validator('hello world')).toEqual({ valid: true })
  })

  it('returns valid when value is in skippedBranches without running validators', () => {
    const skipFn = vi.fn().mockReturnValue({ valid: true })
    const validator = composeWithSkip(['feature/abc'], skipFn)
    const result = validator('feature/abc')
    expect(result).toEqual({ valid: true })
    // validators should not be called for a skipped branch
    expect(skipFn).not.toHaveBeenCalled()
  })

  it('runs validators normally when value is not in skippedBranches', () => {
    const validator = composeWithSkip(['feature/abc'], required(), minLength(10))
    const result = validator('hi')
    expect(result.valid).toBe(false)
    expect((result as { valid: false; error: string }).error).toBe('Must be at least 10 characters')
  })

  it('is idempotent — adding same branch twice does not break validation', () => {
    const validator = composeWithSkip(['branch-x', 'branch-x'], required())
    // 'branch-x' is in the skip list so it should pass required()
    expect(validator('branch-x')).toEqual({ valid: true })
    // values not in the list still run validators
    expect(validator('')).toEqual({ valid: false, error: 'This field is required' })
  })

  it('skipped branch short-circuits even when later validators would fail', () => {
    const validator = composeWithSkip(['dead-branch'], minLength(100), required())
    // 'dead-branch' is skipped so it should return valid immediately
    expect(validator('dead-branch')).toEqual({ valid: true })
    // a non-skipped value runs validators and fails on minLength
    const result = validator('short')
    expect(result.valid).toBe(false)
    expect((result as { valid: false; error: string }).error).toBe('Must be at least 100 characters')
  })

  it('handles multiple skipped branches independently', () => {
    const validator = composeWithSkip(['branch-a', 'branch-b'], minLength(20))
    expect(validator('branch-a')).toEqual({ valid: true })
    expect(validator('branch-b')).toEqual({ valid: true })
    expect(validator('other')).toEqual({ valid: false, error: 'Must be at least 20 characters' })
  })
})
