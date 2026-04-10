import { describe, it, expect } from 'vitest'
import { formatPhoneNumber } from './formatPhoneNumber'

describe('formatPhoneNumber', () => {
  it('formats a 10-digit US number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
  })

  it('formats a 10-digit US number with dashes', () => {
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890')
  })

  it('formats an 11-digit US number starting with 1', () => {
    expect(formatPhoneNumber('11234567890')).toBe('(123) 456-7890')
  })

  it('formats a US number with country code 1 and plus sign', () => {
    expect(formatPhoneNumber('+11234567890')).toBe('+1 (123) 456-7890')
  })

  it('formats a US number with spaces', () => {
    expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890')
  })

  it('formats a US number with parentheses', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
  })

  it('returns empty string for empty input', () => {
    expect(formatPhoneNumber('')).toBe('')
  })

  it('returns empty string for non-numeric input', () => {
    expect(formatPhoneNumber('abcdefghij')).toBe('')
  })

  it('handles international numbers with country code option', () => {
    expect(formatPhoneNumber('1234567890', { countryCode: '44' })).toBe('+44 (123) 456-7890')
  })

  it('handles international numbers with country code in input', () => {
    expect(formatPhoneNumber('+441234567890')).toBe('+44 (123) 456-7890')
  })

  it('returns the digits for numbers with fewer than 10 digits', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })
})
