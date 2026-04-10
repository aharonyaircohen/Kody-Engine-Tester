import { describe, it, expect } from 'vitest'
import { toSnakeCase } from './string'

describe('toSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world')
  })

  it('should convert PascalCase to snake_case', () => {
    expect(toSnakeCase('HelloWorld')).toBe('hello_world')
  })

  it('should convert kebab-case to snake_case', () => {
    expect(toSnakeCase('hello-world')).toBe('hello_world')
  })

  it('should convert spaces to underscores', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world')
  })

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('')
  })

  it('should handle already snake_case', () => {
    expect(toSnakeCase('hello_world')).toBe('hello_world')
  })

  it('should handle mixed separators', () => {
    expect(toSnakeCase('Hello-World Foo')).toBe('hello_world_foo')
  })
})
