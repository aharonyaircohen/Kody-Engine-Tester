import { describe, it, expect } from 'vitest'
import { formatPhoneNumber, formatCreditCard } from './index'

describe('formatPhoneNumber', () => {
  describe('standard formatting', () => {
    it('formats a 10-digit number as (XXX) XXX-XXXX', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
    })

    it('formats with any 10 consecutive digits in a longer string', () => {
      expect(formatPhoneNumber('abc1234567890xyz')).toBe('(123) 456-7890')
    })
  })

  describe('edge cases', () => {
    it('returns input unchanged for short numbers (less than 10 digits)', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('12345')).toBe('12345')
      expect(formatPhoneNumber('123456789')).toBe('123456789')
    })

    it('truncates long numbers to 10 digits before formatting', () => {
      expect(formatPhoneNumber('12345678901234')).toBe('(123) 456-7890')
    })

    it('handles empty string', () => {
      expect(formatPhoneNumber('')).toBe('')
    })

    it('handles non-digit characters by stripping them', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
    })

    it('handles mixed digits and letters', () => {
      expect(formatPhoneNumber('phone: 5551234567')).toBe('(555) 123-4567')
    })
  })
})

describe('formatCreditCard', () => {
  describe('standard masking', () => {
    it('masks all but last 4 digits', () => {
      expect(formatCreditCard('1234567890123456')).toBe('**** **** **** 3456')
    })

    it('handles 16-digit string', () => {
      expect(formatCreditCard('0000111122223333')).toBe('**** **** **** 3333')
    })
  })

  describe('edge cases', () => {
    it('returns short numbers (4 or fewer digits) as-is', () => {
      expect(formatCreditCard('1234')).toBe('1234')
      expect(formatCreditCard('1')).toBe('1')
      expect(formatCreditCard('')).toBe('')
    })

    it('strips non-digit characters before processing', () => {
      expect(formatCreditCard('1234-5678-9012-3456')).toBe('**** **** **** 3456')
    })

    it('handles mixed input with digits', () => {
      expect(formatCreditCard('card: 5555444433332222')).toBe('**** **** **** 2222')
    })
  })
})
