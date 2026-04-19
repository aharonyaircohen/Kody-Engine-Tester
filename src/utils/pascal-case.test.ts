import { describe, it, expect } from 'vitest'
import { pascalCase } from './pascal-case'

describe('pascalCase', () => {
  it('converts dash-separated words to PascalCase', () => {
    expect(pascalCase('foo-bar')).toBe('FooBar')
  })

  it('converts underscore-separated words to PascalCase', () => {
    expect(pascalCase('hello_world')).toBe('HelloWorld')
  })

  it('converts space-separated words to PascalCase', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld')
  })

  it('handles empty string', () => {
    expect(pascalCase('')).toBe('')
  })

  it('handles single word', () => {
    expect(pascalCase('hello')).toBe('Hello')
  })

  it('handles already PascalCase input', () => {
    expect(pascalCase('HelloWorld')).toBe('Helloworld')
  })

  it('handles leading separators', () => {
    expect(pascalCase('-foo-bar')).toBe('FooBar')
  })

  it('handles trailing separators', () => {
    expect(pascalCase('foo-bar-')).toBe('FooBar')
  })
})
