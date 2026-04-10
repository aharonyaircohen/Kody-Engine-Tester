import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('returns empty string for empty array', () => {
    expect(toCsv([])).toBe('')
  })

  it('converts a single row to CSV', () => {
    const rows = [{ name: 'John', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\nJohn,30')
  })

  it('converts multiple rows to CSV', () => {
    const rows = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]
    expect(toCsv(rows)).toBe('name,age\nJohn,30\nJane,25')
  })

  it('uses provided columns order when specified', () => {
    const rows = [{ name: 'John', age: 30 }]
    expect(toCsv(rows, ['age', 'name'])).toBe('age,name\n30,John')
  })

  it('quotes values containing commas', () => {
    const rows = [{ name: 'Doe, John', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Doe, John",30')
  })

  it('quotes values containing double quotes', () => {
    const rows = [{ name: 'John "Jack" Doe', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"John ""Jack"" Doe",30')
  })

  it('quotes values containing newlines', () => {
    const rows = [{ name: 'John\nDoe', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"John\nDoe",30')
  })

  it('handles numeric values', () => {
    const rows = [{ name: 'John', age: 30, score: 95.5 }]
    expect(toCsv(rows)).toBe('name,age,score\nJohn,30,95.5')
  })

  it('handles values that are only numbers as strings', () => {
    const rows = [{ value: '123' }]
    expect(toCsv(rows)).toBe('value\n123')
  })

  it('handles empty string values', () => {
    const rows = [{ name: '', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n,30')
  })

  it('handles special characters in combination', () => {
    const rows = [{ name: 'Doe, "John"', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Doe, ""John""",30')
  })

  it('uses columns from first row when columns not provided', () => {
    const rows = [{ a: 1, b: 2, c: 3 }]
    expect(toCsv(rows)).toBe('a,b,c\n1,2,3')
  })

  it('filters to only specified columns', () => {
    const rows = [{ a: 1, b: 2, c: 3 }]
    expect(toCsv(rows, ['a', 'c'])).toBe('a,c\n1,3')
  })

  it('handles single column selection', () => {
    const rows = [{ name: 'John', age: 30 }]
    expect(toCsv(rows, ['name'])).toBe('name\nJohn')
  })
})
