import { describe, expect, it } from 'vitest'

import { isValidIsbn, isValidIsbn10, isValidIsbn13 } from './isbn-validator'

describe('isValidIsbn10', () => {
  it('returns true for valid ISBN-10', () => {
    // 0-306-40615-2: (0*1 + 3*2 + 0*3 + 6*4 + 4*5 + 0*6 + 6*7 + 1*8 + 5*9 + 2*10) % 11 = 0
    expect(isValidIsbn10('0-306-40615-2')).toBe(true)
    expect(isValidIsbn10('0306406152')).toBe(true)
  })

  it('returns true for valid ISBN-10 with X as check digit', () => {
    // 080442957X: check digit is X (=10)
    expect(isValidIsbn10('080442957X')).toBe(true)
    expect(isValidIsbn10('080442957x')).toBe(true) // lowercase x also works
  })

  it('returns false for invalid check digit', () => {
    expect(isValidIsbn10('0-306-40615-3')).toBe(false) // wrong check digit
  })

  it('returns false for wrong length', () => {
    expect(isValidIsbn10('12345')).toBe(false)
    expect(isValidIsbn10('12345678901234')).toBe(false)
  })

  it('returns false for non-numeric characters in first 9 positions', () => {
    expect(isValidIsbn10('ABC-40615-2')).toBe(false)
    expect(isValidIsbn10('0-306-4061A-2')).toBe(false)
  })

  it('returns false for invalid last character (not digit or X)', () => {
    expect(isValidIsbn10('030640615Z')).toBe(false)
  })

  it('handles whitespace and hyphens', () => {
    expect(isValidIsbn10('0-306-40615-2')).toBe(true)
    expect(isValidIsbn10('0 306 40615 2')).toBe(true)
  })

  it('returns false for null/undefined/empty', () => {
    expect(isValidIsbn10('')).toBe(false)
    expect(isValidIsbn10(null as unknown as string)).toBe(false)
    expect(isValidIsbn10(undefined as unknown as string)).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidIsbn10(1234567890 as unknown as string)).toBe(false)
  })
})

describe('isValidIsbn13', () => {
  it('returns true for valid ISBN-13', () => {
    // 978-0-306-40615-7
    expect(isValidIsbn13('978-0-306-40615-7')).toBe(true)
    expect(isValidIsbn13('9780306406157')).toBe(true)
  })

  it('returns false for invalid check digit', () => {
    expect(isValidIsbn13('978-0-306-40615-8')).toBe(false) // wrong check digit
  })

  it('returns false for wrong length', () => {
    expect(isValidIsbn13('12345')).toBe(false)
    expect(isValidIsbn13('123456789012345')).toBe(false)
  })

  it('returns false for non-numeric characters', () => {
    expect(isValidIsbn13('978-0-306-4061A-7')).toBe(false)
    expect(isValidIsbn13('978ABC406157')).toBe(false)
  })

  it('handles whitespace and hyphens', () => {
    expect(isValidIsbn13('978-0-306-40615-7')).toBe(true)
    expect(isValidIsbn13('978 0 306 40615 7')).toBe(true)
  })

  it('returns false for null/undefined/empty', () => {
    expect(isValidIsbn13('')).toBe(false)
    expect(isValidIsbn13(null as unknown as string)).toBe(false)
    expect(isValidIsbn13(undefined as unknown as string)).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidIsbn13(1234567890123 as unknown as string)).toBe(false)
  })
})

describe('isValidIsbn', () => {
  it('delegates to isValidIsbn10 for 10-digit ISBNs', () => {
    expect(isValidIsbn('0-306-40615-2')).toBe(true)
    expect(isValidIsbn('080442957X')).toBe(true)
    expect(isValidIsbn('0-306-40615-3')).toBe(false)
  })

  it('delegates to isValidIsbn13 for 13-digit ISBNs', () => {
    expect(isValidIsbn('978-0-306-40615-7')).toBe(true)
    expect(isValidIsbn('9780306406157')).toBe(true)
    expect(isValidIsbn('978-0-306-40615-8')).toBe(false)
  })

  it('returns false for invalid length', () => {
    expect(isValidIsbn('12345')).toBe(false)
    expect(isValidIsbn('123456789012345')).toBe(false)
  })

  it('returns false for null/undefined/empty', () => {
    expect(isValidIsbn('')).toBe(false)
    expect(isValidIsbn(null as unknown as string)).toBe(false)
    expect(isValidIsbn(undefined as unknown as string)).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidIsbn(123 as unknown as string)).toBe(false)
  })
})
