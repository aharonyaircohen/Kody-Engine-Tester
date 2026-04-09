import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('should export basic rows to CSV', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    const result = toCsv(rows)
    expect(result).toBe('name,age\nAlice,30\nBob,25')
  })

  it('should respect the columns parameter', () => {
    const rows = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' },
    ]
    const result = toCsv(rows, ['name', 'age'])
    expect(result).toBe('name,age\nAlice,30\nBob,25')
  })

  it('should quote values containing commas', () => {
    const rows = [
      { name: 'Hello, World', value: 42 },
    ]
    const result = toCsv(rows)
    expect(result).toBe('name,value\n"Hello, World",42')
  })

  it('should quote and escape values containing quotes', () => {
    const rows = [
      { name: 'Say "Hello"', value: 1 },
    ]
    const result = toCsv(rows)
    expect(result).toBe('name,value\n"Say ""Hello""",1')
  })

  it('should quote values containing newlines', () => {
    const rows = [
      { name: 'Line1\nLine2', value: 1 },
    ]
    const result = toCsv(rows)
    expect(result).toBe('name,value\n"Line1\nLine2",1')
  })

  it('should handle empty rows array', () => {
    expect(toCsv([])).toBe('')
  })

  it('should handle numbers as values', () => {
    const rows = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]
    expect(toCsv(rows)).toBe('a,b\n1,2\n3,4')
  })

  it('should quote values with commas and quotes', () => {
    const rows = [
      { name: 'Say "Hello, World"', value: 1 },
    ]
    const result = toCsv(rows)
    expect(result).toBe('name,value\n"Say ""Hello, World""",1')
  })
})
