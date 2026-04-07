import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('should export basic rows to CSV', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    const expected = 'name,age\nAlice,30\nBob,25'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should handle custom column ordering', () => {
    const rows = [{ name: 'Alice', age: 30, city: 'NYC' }]
    const columns = ['name', 'age']
    const expected = 'name,age\nAlice,30'
    expect(toCsv(rows, columns)).toEqual(expected)
  })

  it('should quote values containing commas', () => {
    const rows = [{ name: 'Hello, World', value: 42 }]
    const expected = 'name,value\n"Hello, World",42'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should escape internal double quotes by doubling them', () => {
    const rows = [{ name: 'Say "Hello"', value: 1 }]
    const expected = 'name,value\n"Say ""Hello""",1'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should quote values containing both commas and quotes', () => {
    const rows = [{ name: 'Say "Hello, World"', value: 1 }]
    const expected = 'name,value\n"Say ""Hello, World""",1'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should return empty string for empty array', () => {
    expect(toCsv([])).toEqual('')
  })

  it('should handle numeric values', () => {
    const rows = [{ a: 1, b: 2.5, c: -3 }]
    const expected = 'a,b,c\n1,2.5,-3'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should quote values with newlines', () => {
    const rows = [{ text: 'line1\nline2' }]
    const expected = 'text\n"line1\nline2"'
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should handle missing values as empty strings', () => {
    const rows: Record<string, string | number>[] = [
      { name: 'Alice' },
      { name: 'Bob', age: 25 },
    ]
    const expected = 'name,age\nAlice,\nBob,25'
    expect(toCsv(rows)).toEqual(expected)
  })
})
