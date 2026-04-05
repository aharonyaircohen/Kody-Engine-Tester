import { describe, expect, it } from 'vitest'

import { checkPasswordStrength } from './password-strength'

describe('checkPasswordStrength', () => {
  describe('weak passwords', () => {
    it('rates empty password as weak', () => {
      const result = checkPasswordStrength('')
      expect(result.strength).toBe('weak')
      expect(result.score).toBe(0)
      expect(result.entropy).toBe(0)
    })

    it('rates short password as weak', () => {
      const result = checkPasswordStrength('abc')
      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(5)
    })

    it('rates password with no variety as weak', () => {
      const result = checkPasswordStrength('abcdefgh')
      expect(result.strength).toBe('weak')
    })

    it('rates lowercase-only password as weak', () => {
      const result = checkPasswordStrength('password')
      expect(result.strength).toBe('weak')
    })

    it('rates numbers-only password as weak', () => {
      const result = checkPasswordStrength('12345678')
      expect(result.strength).toBe('weak')
    })
  })

  describe('medium passwords', () => {
    it('rates mixed case with numbers as medium', () => {
      const result = checkPasswordStrength('Password1')
      expect(result.strength).toBe('medium')
    })

    it('rates longer password with limited variety as medium', () => {
      // 'Pass1234' has length 8, mixed case, numbers, entropy ~48 → score 6
      const result = checkPasswordStrength('Pass1234')
      expect(result.strength).toBe('medium')
    })

    it('rates password with special chars but short as medium', () => {
      const result = checkPasswordStrength('P@ssw0rd')
      expect(result.strength).toBe('medium')
    })
  })

  describe('strong passwords', () => {
    it('rates long mixed case with special chars as strong', () => {
      const result = checkPasswordStrength('P@ssw0rd!2024')
      expect(result.strength).toBe('strong')
      expect(result.score).toBeGreaterThanOrEqual(9)
    })

    it('rates very long password with all character types as strong', () => {
      const result = checkPasswordStrength('MyP@ssw0rd!2024Secure')
      expect(result.strength).toBe('strong')
    })

    it('rates high entropy password as strong', () => {
      const result = checkPasswordStrength('xK9#mP2$vL5@nQ8!')
      expect(result.strength).toBe('strong')
      expect(result.entropy).toBeGreaterThan(60)
    })
  })

  describe('entropy calculation', () => {
    it('calculates higher entropy for larger character sets', () => {
      const lowercase = checkPasswordStrength('abcdefgh')
      const mixed = checkPasswordStrength('abcdEFGH')
      const withNumbers = checkPasswordStrength('abcd1234')
      const withSpecial = checkPasswordStrength('abcd!@#$')

      expect(mixed.entropy).toBeGreaterThan(lowercase.entropy)
      expect(withNumbers.entropy).toBeGreaterThan(lowercase.entropy)
      expect(withSpecial.entropy).toBeGreaterThan(lowercase.entropy)
    })

    it('calculates higher entropy for longer passwords', () => {
      const short = checkPasswordStrength('abc')
      const medium = checkPasswordStrength('abcdef')
      const long = checkPasswordStrength('abcdefghij')

      expect(long.entropy).toBeGreaterThan(medium.entropy)
      expect(medium.entropy).toBeGreaterThan(short.entropy)
    })

    it('returns 0 entropy for empty password', () => {
      const result = checkPasswordStrength('')
      expect(result.entropy).toBe(0)
    })

    it('rounds entropy to nearest integer', () => {
      const result = checkPasswordStrength('abc')
      expect(Number.isInteger(result.entropy)).toBe(true)
    })
  })

  describe('score calculation', () => {
    it('increases score with length', () => {
      const short = checkPasswordStrength('Aa1!')
      const longer = checkPasswordStrength('Aa1!Bb2@')
      expect(longer.score).toBeGreaterThan(short.score)
    })

    it('increases score with character variety', () => {
      const lowercase = checkPasswordStrength('abcdefgh')
      const mixed = checkPasswordStrength('abcdefGH')
      expect(mixed.score).toBeGreaterThan(lowercase.score)
    })

    it('increases score with special characters', () => {
      const without = checkPasswordStrength('Password123')
      const withSpecial = checkPasswordStrength('Password!23')
      expect(withSpecial.score).toBeGreaterThan(without.score)
    })

    it('gives entropy bonus for high entropy passwords', () => {
      const basic = checkPasswordStrength('Password1!')
      const highEntropy = checkPasswordStrength('xK9#mP2$vL5@nQ8!')
      expect(highEntropy.score).toBeGreaterThan(basic.score)
    })
  })

  describe('edge cases', () => {
    it('handles whitespace in password', () => {
      const result = checkPasswordStrength('pass word 123')
      expect(result.strength).toBeDefined()
      expect(result.score).toBeGreaterThan(0)
    })

    it('handles unicode characters', () => {
      const result = checkPasswordStrength('пароль123')
      expect(result.strength).toBeDefined()
    })

    it('handles very long passwords', () => {
      const longPassword = 'A!1' + 'a'.repeat(100)
      const result = checkPasswordStrength(longPassword)
      expect(result.entropy).toBeGreaterThan(100)
      expect(result.strength).toBe('strong')
    })
  })
})
