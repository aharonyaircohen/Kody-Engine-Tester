import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('exports basic rows with headers from first row keys', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,30\nBob,25')
  })

  it('exports rows with specified column order', () => {
    const rows = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' },
    ]
    expect(toCsv(rows, ['name', 'age'])).toBe('name,age\nAlice,30\nBob,25')
  })

  it('handles values containing commas with proper quoting', () => {
    const rows = [
      { name: 'Hello, World', value: 'test' },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Hello, World",test')
  })

  it('handles values containing double quotes by doubling them', () => {
    const rows = [
      { name: 'Say "Hello"', value: 'test' },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Say ""Hello""",test')
  })

  it('handles values containing newlines with proper quoting', () => {
    const rows = [
      { name: 'Line1\nLine2', value: 'test' },
    ]
    expect(toCsv(rows)).toBe('name,value\n"Line1\nLine2",test')
  })

  it('handles numeric values', () => {
    const rows = [
      { name: 'Alice', score: 100 },
      { name: 'Bob', score: 95 },
    ]
    expect(toCsv(rows)).toBe('name,score\nAlice,100\nBob,95')
  })

  it('returns empty string for empty rows array', () => {
    expect(toCsv([])).toBe('')
  })

  it('handles missing values as empty strings', () => {
    const rows = [
      { name: 'Alice', age: undefined as unknown as number },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,')
  })

  it('handles values that are only commas', () => {
    const rows = [
      { value: ',' },
    ]
    expect(toCsv(rows)).toBe('value\n","')
  })

  it('handles complex real-world data', () => {
    const rows = [
      { name: 'Alice Johnson', email: 'alice@example.com', score: 95.5 },
      { name: 'Bob, Jr.', email: 'bob@example.com', score: 88.2 },
    ]
    const result = toCsv(rows)
    expect(result).toContain('name,email,score')
    expect(result).toContain('Alice Johnson,alice@example.com,95.5')
    expect(result).toContain('"Bob, Jr.",bob@example.com,88.2')
  })

  it('overrides column order with custom columns array', () => {
    const rows = [
      { a: '1', b: '2', c: '3' },
    ]
    expect(toCsv(rows, ['c', 'b', 'a'])).toBe('c,b,a\n3,2,1')
  })

  it('handles values that are only quotes', () => {
    const rows = [
      { value: '""' },
    ]
    expect(toCsv(rows)).toBe('value\n""""""')
  })
})