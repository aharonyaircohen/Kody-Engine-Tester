import { describe, expect, it } from 'vitest'

import { morseToText, textToMorse } from './morse-code'

describe('textToMorse', () => {
  it('translates single letters', () => {
    expect(textToMorse('A')).toBe('.-')
    expect(textToMorse('E')).toBe('.')
    expect(textToMorse('T')).toBe('-')
  })

  it('translates multiple letters', () => {
    expect(textToMorse('SOS')).toBe('... --- ...')
    expect(textToMorse('HELLO')).toBe('.... . .-.. .-.. ---')
  })

  it('translates lowercase to uppercase', () => {
    expect(textToMorse('abc')).toBe('.- -... -.-.')
  })

  it('translates numbers', () => {
    expect(textToMorse('123')).toBe('.---- ..--- ...--')
    expect(textToMorse('0')).toBe('-----')
  })

  it('returns empty string for empty input', () => {
    expect(textToMorse('')).toBe('')
  })

  it('handles mixed case with numbers', () => {
    expect(textToMorse('Hello World 123')).toBe('.... . .-.. .-.. ---   .-- --- .-. .-.. -..   .---- ..--- ...--')
  })

  it('ignores unsupported characters', () => {
    expect(textToMorse('A!B')).toBe('.- -...')
  })
})

describe('morseToText', () => {
  it('translates single codes', () => {
    expect(morseToText('.-')).toBe('A')
    expect(morseToText('.')).toBe('E')
    expect(morseToText('-')).toBe('T')
  })

  it('translates multiple codes', () => {
    expect(morseToText('... --- ...')).toBe('SOS')
    expect(morseToText('.... . .-.. .-.. ---')).toBe('HELLO')
  })

  it('translates numbers', () => {
    expect(morseToText('.---- ..--- ...--')).toBe('123')
    expect(morseToText('-----')).toBe('0')
  })

  it('returns empty string for empty input', () => {
    expect(morseToText('')).toBe('')
  })

  it('handles space separators', () => {
    expect(morseToText('.... . .-.. .-.. ---   .-- --- .-. .-.. -..')).toBe('HELLOWORLD')
  })
})

describe('round-trip', () => {
  it('textToMorse then morseToText returns original text (uppercase)', () => {
    const original = 'HELLO WORLD 123'
    const morse = textToMorse(original)
    const result = morseToText(morse)
    expect(result).toBe(original.replace(/ /g, ''))
  })
})
