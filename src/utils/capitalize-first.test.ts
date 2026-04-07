import { describe, it, expect } from 'vitest'
import { capitalizeFirst } from './capitalize-first'

describe('capitalizeFirst', () => {
  it('capitalizes only the first letter', () => {
    expect(capitalizeFirst('hello world')).toBe('Hello world')
  })

  it('handles single word', () => {
    expect(capitalizeFirst('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalizeFirst('')).toBe('')
  })

  it('handles already capitalized string', () => {
    expect(capitalizeFirst('Hello world')).toBe('Hello world')
  })

  it('capitalizes first letter and keeps rest intact', () => {
    expect(capitalizeFirst('hELLO WORLD')).toBe('HELLO WORLD')
  })

  it('handles single character', () => {
    expect(capitalizeFirst('a')).toBe('A')
  })
})