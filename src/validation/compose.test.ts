import { describe, it, expect } from 'vitest'
import { compose } from './compose'
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
