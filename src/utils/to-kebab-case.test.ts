import { describe, it, expect } from 'vitest'
import { toKebabCase } from './to-kebab-case'

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world')
  })

  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('MyComponent')).toBe('my-component')
  })

  it('converts already kebab-case to lowercase', () => {
    expect(toKebabCase('already-kebab')).toBe('already-kebab')
  })

  it('handles empty string', () => {
    expect(toKebabCase('')).toBe('')
  })

  it('handles single word', () => {
    expect(toKebabCase('hello')).toBe('hello')
  })

  it('handles multiple capital letters in a row', () => {
    expect(toKebabCase('XMLParser')).toBe('xml-parser')
  })

  it('handles mixed case with numbers', () => {
    expect(toKebabCase('test123String')).toBe('test123-string')
  })

  it('converts snake_case to kebab-case', () => {
    expect(toKebabCase('hello_world')).toBe('hello-world')
  })
})
