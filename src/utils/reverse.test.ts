import { describe, it, expect } from 'vitest'
import { reverse } from './reverse'

describe('reverse', () => {
  it('reverses a simple string', () => {
    expect(reverse('hello')).toBe('olleh')
  })

  it('reverses an empty string', () => {
    expect(reverse('')).toBe('')
  })

  it('reverses a single character', () => {
    expect(reverse('a')).toBe('a')
  })

  it('reverses a string with spaces', () => {
    expect(reverse('hello world')).toBe('dlrow olleh')
  })
})
