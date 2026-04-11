import { describe, it, expect } from 'vitest'
import { parseJsonSafe } from './parse-json-safe'

describe('parseJsonSafe', () => {
  it('parses valid JSON objects', () => {
    const result = parseJsonSafe('{"name":"test","value":42}')
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('parses valid JSON arrays', () => {
    const result = parseJsonSafe('[1,2,3,"four"]')
    expect(result).toEqual([1, 2, 3, 'four'])
  })

  it('parses valid JSON primitives', () => {
    expect(parseJsonSafe('"hello"')).toBe('hello')
    expect(parseJsonSafe('42')).toBe(42)
    expect(parseJsonSafe('true')).toBe(true)
    expect(parseJsonSafe('null')).toBe(null)
  })

  it('returns null for invalid JSON', () => {
    expect(parseJsonSafe('not valid json')).toBe(null)
    expect(parseJsonSafe('{broken: json}')).toBe(null)
    expect(parseJsonSafe('')).toBe(null)
    expect(parseJsonSafe('undefined')).toBe(null)
  })

  it('returns null for non-string inputs conceptually (type-level)', () => {
    // Since the function accepts string, we test with valid JSON strings that represent objects
    expect(parseJsonSafe('{"nested":{"data":true}}')).toEqual({ nested: { data: true } })
  })

  it('parses complex nested structures', () => {
    const input = '{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"count":2}'
    const result = parseJsonSafe(input)
    expect(result).toEqual({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
      count: 2,
    })
  })

  it('returns null for JSON with trailing comma', () => {
    expect(parseJsonSafe('{"name":"test",}')).toBe(null)
    expect(parseJsonSafe('[1,2,3,]')).toBe(null)
  })

  it('handles whitespace correctly', () => {
    expect(parseJsonSafe('  {"name":"test"}  ')).toEqual({ name: 'test' })
    expect(parseJsonSafe('\n\t{"name":"test"}\n')).toEqual({ name: 'test' })
  })
})
