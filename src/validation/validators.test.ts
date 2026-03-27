import { describe, it, expect } from 'vitest'
import { required, minLength, maxLength, pattern, email, min, max, oneOf } from './validators'

describe('required', () => {
  it('returns valid for non-empty string', () => {
    expect(required()('hello')).toEqual({ valid: true })
  })

  it('returns invalid for empty string', () => {
    expect(required()('')).toEqual({ valid: false, error: 'This field is required' })
  })

  it('returns invalid for whitespace-only string', () => {
    expect(required()('   ')).toEqual({ valid: false, error: 'This field is required' })
  })

  it('returns invalid for null', () => {
    expect(required()(null)).toEqual({ valid: false, error: 'This field is required' })
  })

  it('returns invalid for undefined', () => {
    expect(required()(undefined)).toEqual({ valid: false, error: 'This field is required' })
  })
})

describe('minLength', () => {
  it('returns valid when value meets minimum length', () => {
    expect(minLength(3)('abc')).toEqual({ valid: true })
    expect(minLength(3)('abcdef')).toEqual({ valid: true })
  })

  it('returns invalid when value is below minimum length', () => {
    expect(minLength(3)('ab')).toEqual({ valid: false, error: 'Must be at least 3 characters' })
  })

  it('returns valid for empty string when min is 0', () => {
    expect(minLength(0)('')).toEqual({ valid: true })
  })

  it('works with numeric strings', () => {
    expect(minLength(4)('1234')).toEqual({ valid: true })
    expect(minLength(4)('123')).toEqual({ valid: false, error: 'Must be at least 4 characters' })
  })
})

describe('maxLength', () => {
  it('returns valid when value is within max length', () => {
    expect(maxLength(5)('abc')).toEqual({ valid: true })
    expect(maxLength(5)('abcde')).toEqual({ valid: true })
  })

  it('returns invalid when value exceeds max length', () => {
    expect(maxLength(5)('abcdef')).toEqual({ valid: false, error: 'Must be at most 5 characters' })
  })

  it('returns valid for empty string', () => {
    expect(maxLength(5)('')).toEqual({ valid: true })
  })
})

describe('pattern', () => {
  it('returns valid when value matches pattern', () => {
    const validator = pattern(/^[a-z]+$/, 'Only lowercase letters allowed')
    expect(validator('hello')).toEqual({ valid: true })
  })

  it('returns invalid with custom error message when pattern does not match', () => {
    const validator = pattern(/^[a-z]+$/, 'Only lowercase letters allowed')
    expect(validator('Hello123')).toEqual({ valid: false, error: 'Only lowercase letters allowed' })
    // empty string passes pattern — use required() for non-empty enforcement
    expect(validator('')).toEqual({ valid: true })
  })

  it('returns valid for empty string (pattern does not require non-empty)', () => {
    const validator = pattern(/^\d+$/, 'Must be digits only')
    expect(validator('')).toEqual({ valid: true })
  })
})

describe('email', () => {
  it('returns valid for valid email addresses', () => {
    expect(email()('test@example.com')).toEqual({ valid: true })
    expect(email()('user.name+tag@domain.co.uk')).toEqual({ valid: true })
  })

  it('returns invalid for invalid email addresses', () => {
    expect(email()('notanemail')).toEqual({ valid: false, error: 'Invalid email address' })
    expect(email()('missing@')).toEqual({ valid: false, error: 'Invalid email address' })
    expect(email()('@nodomain.com')).toEqual({ valid: false, error: 'Invalid email address' })
    expect(email()('spaces in@email.com')).toEqual({ valid: false, error: 'Invalid email address' })
  })

  it('returns valid for empty string', () => {
    expect(email()('')).toEqual({ valid: true })
  })
})

describe('min', () => {
  it('returns valid when value is above minimum', () => {
    expect(min(5)(10)).toEqual({ valid: true })
    expect(min(5)(5)).toEqual({ valid: true })
  })

  it('returns invalid when value is below minimum', () => {
    expect(min(5)(4)).toEqual({ valid: false, error: 'Must be at least 5' })
  })

  it('works with negative numbers', () => {
    expect(min(-10)(-5)).toEqual({ valid: true })
    expect(min(-10)(-15)).toEqual({ valid: false, error: 'Must be at least -10' })
  })

  it('works with floats', () => {
    expect(min(1.5)(2.0)).toEqual({ valid: true })
    expect(min(1.5)(1.4)).toEqual({ valid: false, error: 'Must be at least 1.5' })
  })
})

describe('max', () => {
  it('returns valid when value is below maximum', () => {
    expect(max(10)(5)).toEqual({ valid: true })
    expect(max(10)(10)).toEqual({ valid: true })
  })

  it('returns invalid when value exceeds maximum', () => {
    expect(max(10)(11)).toEqual({ valid: false, error: 'Must be at most 10' })
  })

  it('works with negative numbers', () => {
    expect(max(-5)(-10)).toEqual({ valid: true })
    expect(max(-5)(-1)).toEqual({ valid: false, error: 'Must be at most -5' })
  })

  it('works with floats', () => {
    expect(max(1.5)(1.4)).toEqual({ valid: true })
    expect(max(1.5)(1.6)).toEqual({ valid: false, error: 'Must be at most 1.5' })
  })
})

describe('oneOf', () => {
  it('returns valid when value is in the allowed list', () => {
    expect(oneOf(['red', 'green', 'blue'])('red')).toEqual({ valid: true })
    expect(oneOf(['red', 'green', 'blue'])('green')).toEqual({ valid: true })
  })

  it('returns invalid with default message when value is not in the allowed list', () => {
    const result = oneOf(['red', 'green', 'blue'])('yellow')
    expect(result.valid).toBe(false)
    expect((result as { valid: false; error: string }).error).toBe('Must be one of: red, green, blue')
  })

  it('returns invalid for custom error message when value is not in the allowed list', () => {
    const validator = oneOf(['red', 'green', 'blue'], 'Choose a primary color')
    expect(validator('yellow')).toEqual({ valid: false, error: 'Choose a primary color' })
  })
})
