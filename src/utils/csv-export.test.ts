import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('exports basic rows with headers', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,30\nBob,25')
  })

  it('exports only specified columns when columns parameter is provided', () => {
    const rows = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' },
    ]
    expect(toCsv(rows, ['name', 'age'])).toBe('name,age\nAlice,30\nBob,25')
  })

  it('handles values containing commas by quoting them', () => {
    const rows = [{ name: 'Doe, John', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Doe, John",30')
  })

  it('handles values containing quotes by escaping them', () => {
    const rows = [{ name: 'Say "Hello"', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Say ""Hello""",30')
  })

  it('handles values containing newlines by quoting them', () => {
    const rows = [{ name: 'Line1\nLine2', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Line1\nLine2",30')
  })

  it('handles values containing carriage returns by quoting them', () => {
    const rows = [{ name: 'Line1\rLine2', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Line1\rLine2",30')
  })

  it('handles numeric values', () => {
    const rows = [
      { name: 'Alice', score: 100 },
      { name: 'Bob', score: 95.5 },
    ]
    expect(toCsv(rows)).toBe('name,score\nAlice,100\nBob,95.5')
  })

  it('returns empty string for empty rows array', () => {
    expect(toCsv([])).toBe('')
  })

  it('handles single row', () => {
    const rows = [{ name: 'Alice', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\nAlice,30')
  })

  it('handles complex values with multiple special characters', () => {
    const rows = [{ name: 'Hello, "World"\nTest', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Hello, ""World""\nTest",30')
  })

  it('handles values that are only quotes', () => {
    const rows = [{ name: '""', age: 30 }]
    // "" data → each quote doubled → """" → wrapped in quotes → """""""
    expect(toCsv(rows)).toBe('name,age\n"""""",30')
  })

  it('handles empty values', () => {
    const rows = [{ name: '', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n,30')
  })

  it('respects column order when columns array is provided', () => {
    const rows = [{ a: '1', b: '2', c: '3' }]
    expect(toCsv(rows, ['c', 'b', 'a'])).toBe('c,b,a\n3,2,1')
  })

  it('handles column filtering with special characters in values', () => {
    const rows = [
      { name: 'Alice, Bob', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'Los Angeles' },
    ]
    expect(toCsv(rows, ['name', 'city'])).toBe('name,city\n"Alice, Bob",NYC\nBob,Los Angeles')
  })
})
