import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('should convert simple rows to CSV', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,30\nBob,25')
  })

  it('should use custom columns when provided', () => {
    const rows = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' },
    ]
    expect(toCsv(rows, ['name', 'age'])).toBe('name,age\nAlice,30\nBob,25')
  })

  it('should wrap values containing commas in double quotes', () => {
    const rows = [
      { name: 'Hello, World', value: 42 },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Hello, World",42')
  })

  it('should escape double quotes by doubling them', () => {
    const rows = [
      { name: 'Say "Hello"', value: 1 },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Say ""Hello""",1')
  })

  it('should escape both commas and quotes in same value', () => {
    const rows = [
      { name: 'Hello, "World"', value: 1 },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Hello, ""World""",1')
  })

  it('should wrap values containing newlines in double quotes', () => {
    const rows = [
      { name: 'Line1\nLine2', value: 1 },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Line1\nLine2",1')
  })

  it('should return empty string for empty rows array', () => {
    expect(toCsv([])).toBe('')
  })

  it('should handle numeric values', () => {
    const rows = [
      { a: 1, b: 2.5, c: -3 },
      { a: 100, b: 0.001, c: 0 },
    ]
    expect(toCsv(rows)).toBe('a,b,c\n1,2.5,-3\n100,0.001,0')
  })

  it('should handle columns that are not in all rows', () => {
    const rows: Record<string, string | number>[] = [
      { name: 'Alice', age: 30 },
      { name: 'Bob' },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,30\nBob,')
  })

  it('should handle values that are only numbers but as strings', () => {
    const rows = [{ num: '123' as unknown as string | number }]
    expect(toCsv(rows)).toBe('num\n123')
  })
})