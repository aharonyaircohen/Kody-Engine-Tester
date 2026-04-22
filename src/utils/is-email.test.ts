import { describe, expect, it } from 'vitest'

import { isEmail } from './is-email'

describe('isEmail', () => {
  it('returns true for "user@example.com"', () => {
    expect(isEmail('user@example.com')).toBe(true)
  })

  it('returns true for "a.b@c.co"', () => {
    expect(isEmail('a.b@c.co')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isEmail('')).toBe(false)
  })

  it('returns false for "no-at-sign"', () => {
    expect(isEmail('no-at-sign')).toBe(false)
  })

  it('returns false for "@nouser.com"', () => {
    expect(isEmail('@nouser.com')).toBe(false)
  })

  it('returns false for "user@"', () => {
    expect(isEmail('user@')).toBe(false)
  })

  it('returns false for "user@nodot"', () => {
    expect(isEmail('user@nodot')).toBe(false)
  })

  it('returns false for "user @example.com"', () => {
    expect(isEmail('user @example.com')).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isEmail(123 as unknown as string)).toBe(false)
  })
})
