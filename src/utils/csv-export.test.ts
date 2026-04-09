import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('should convert rows to CSV format', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    const expected = `name,age\nAlice,30\nBob,25`
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should use custom column order when provided', () => {
    const rows = [{ name: 'Alice', age: 30 }]
    const columns = ['age', 'name']
    const expected = `age,name\n30,Alice`
    expect(toCsv(rows, columns)).toEqual(expected)
  })

  it('should quote values containing commas', () => {
    const rows = [{ name: 'Doe, John', age: 30 }]
    const expected = `name,age\n"Doe, John",30`
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should quote values containing double quotes', () => {
    const rows = [{ name: 'Say "Hello"', age: 30 }]
    const expected = `name,age\n"Say ""Hello""",30`
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should quote values containing newlines', () => {
    const rows = [{ name: 'Line1\nLine2', age: 30 }]
    const expected = `name,age\n"Line1\nLine2",30`
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should return empty string for empty rows', () => {
    expect(toCsv([])).toEqual('')
  })

  it('should handle numeric values', () => {
    const rows = [{ name: 'Alice', age: 30, score: 95.5 }]
    const expected = `name,age,score\nAlice,30,95.5`
    expect(toCsv(rows)).toEqual(expected)
  })

  it('should handle missing values as empty strings', () => {
    const rows = [{ name: 'Alice' }]
    const columns = ['name', 'age']
    const expected = `name,age\nAlice,`
    expect(toCsv(rows, columns)).toEqual(expected)
  })
})