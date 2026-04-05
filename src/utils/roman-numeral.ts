const ROMAN_PAIRS: Array<{ value: number; numeral: string }> = [
  { value: 1000, numeral: 'M' },
  { value: 900, numeral: 'CM' },
  { value: 500, numeral: 'D' },
  { value: 400, numeral: 'CD' },
  { value: 100, numeral: 'C' },
  { value: 90, numeral: 'XC' },
  { value: 50, numeral: 'L' },
  { value: 40, numeral: 'XL' },
  { value: 10, numeral: 'X' },
  { value: 9, numeral: 'IX' },
  { value: 5, numeral: 'V' },
  { value: 4, numeral: 'IV' },
  { value: 1, numeral: 'I' },
]

const ROMAN_VALUE: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

export function toRoman(num: number): string {
  if (num < 1 || num > 3999) {
    throw new Error('Value must be between 1 and 3999')
  }

  let result = ''
  let remaining = num

  for (const { value, numeral } of ROMAN_PAIRS) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }

  return result
}

export function fromRoman(roman: string): number {
  if (!roman) {
    throw new Error('Roman numeral cannot be empty')
  }

  let result = 0
  let prevValue = 0

  for (let i = roman.length - 1; i >= 0; i--) {
    const char = roman[i]
    const value = ROMAN_VALUE[char.toUpperCase()]

    if (value === undefined) {
      throw new Error(`Invalid Roman numeral character: ${char}`)
    }

    if (value < prevValue) {
      result -= value
    } else {
      result += value
      prevValue = value
    }
  }

  return result
}