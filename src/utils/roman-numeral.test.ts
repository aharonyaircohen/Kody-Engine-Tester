import { describe, expect, it } from 'vitest'

import { fromRoman, toRoman } from './roman-numeral'

describe('toRoman', () => {
  it('converts 1 to I', () => {
    expect(toRoman(1)).toBe('I')
  })

  it('converts 4 to IV', () => {
    expect(toRoman(4)).toBe('IV')
  })

  it('converts 5 to V', () => {
    expect(toRoman(5)).toBe('V')
  })

  it('converts 9 to IX', () => {
    expect(toRoman(9)).toBe('IX')
  })

  it('converts 10 to X', () => {
    expect(toRoman(10)).toBe('X')
  })

  it('converts 40 to XL', () => {
    expect(toRoman(40)).toBe('XL')
  })

  it('converts 50 to L', () => {
    expect(toRoman(50)).toBe('L')
  })

  it('converts 90 to XC', () => {
    expect(toRoman(90)).toBe('XC')
  })

  it('converts 100 to C', () => {
    expect(toRoman(100)).toBe('C')
  })

  it('converts 400 to CD', () => {
    expect(toRoman(400)).toBe('CD')
  })

  it('converts 500 to D', () => {
    expect(toRoman(500)).toBe('D')
  })

  it('converts 900 to CM', () => {
    expect(toRoman(900)).toBe('CM')
  })

  it('converts 1000 to M', () => {
    expect(toRoman(1000)).toBe('M')
  })

  it('converts 3999 to MMMCMXCIX', () => {
    expect(toRoman(3999)).toBe('MMMCMXCIX')
  })

  it('converts 58 to LVIII', () => {
    expect(toRoman(58)).toBe('LVIII')
  })

  it('converts 1994 to MCMXCIV', () => {
    expect(toRoman(1994)).toBe('MCMXCIV')
  })

  it('converts 2024 to MMXXIV', () => {
    expect(toRoman(2024)).toBe('MMXXIV')
  })

  it('throws for values below 1', () => {
    expect(() => toRoman(0)).toThrow('Value must be between 1 and 3999')
    expect(() => toRoman(-1)).toThrow('Value must be between 1 and 3999')
  })

  it('throws for values above 3999', () => {
    expect(() => toRoman(4000)).toThrow('Value must be between 1 and 3999')
  })
})

describe('fromRoman', () => {
  it('converts I to 1', () => {
    expect(fromRoman('I')).toBe(1)
  })

  it('converts IV to 4', () => {
    expect(fromRoman('IV')).toBe(4)
  })

  it('converts V to 5', () => {
    expect(fromRoman('V')).toBe(5)
  })

  it('converts IX to 9', () => {
    expect(fromRoman('IX')).toBe(9)
  })

  it('converts X to 10', () => {
    expect(fromRoman('X')).toBe(10)
  })

  it('converts XL to 40', () => {
    expect(fromRoman('XL')).toBe(40)
  })

  it('converts L to 50', () => {
    expect(fromRoman('L')).toBe(50)
  })

  it('converts XC to 90', () => {
    expect(fromRoman('XC')).toBe(90)
  })

  it('converts C to 100', () => {
    expect(fromRoman('C')).toBe(100)
  })

  it('converts CD to 400', () => {
    expect(fromRoman('CD')).toBe(400)
  })

  it('converts D to 500', () => {
    expect(fromRoman('D')).toBe(500)
  })

  it('converts CM to 900', () => {
    expect(fromRoman('CM')).toBe(900)
  })

  it('converts M to 1000', () => {
    expect(fromRoman('M')).toBe(1000)
  })

  it('converts MMMCMXCIX to 3999', () => {
    expect(fromRoman('MMMCMXCIX')).toBe(3999)
  })

  it('converts LVIII to 58', () => {
    expect(fromRoman('LVIII')).toBe(58)
  })

  it('converts MCMXCIV to 1994', () => {
    expect(fromRoman('MCMXCIV')).toBe(1994)
  })

  it('converts MMXXIV to 2024', () => {
    expect(fromRoman('MMXXIV')).toBe(2024)
  })

  it('converts lowercase to uppercase', () => {
    expect(fromRoman('x')).toBe(10)
    expect(fromRoman('xiv')).toBe(14)
  })

  it('throws for empty string', () => {
    expect(() => fromRoman('')).toThrow('Roman numeral cannot be empty')
  })

  it('throws for invalid characters', () => {
    expect(() => fromRoman('ABC')).toThrow('Invalid Roman numeral character: B')
    expect(() => fromRoman('I234')).toThrow('Invalid Roman numeral character: 4')
  })
})