import { describe, it, expect } from 'vitest'
import { toCsv } from './csv-export'

describe('toCsv', () => {
  it('returns empty string for empty array', () => {
    expect(toCsv([])).toBe('')
  })

  it('converts simple rows to CSV format', () => {
    const rows = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    expect(toCsv(rows)).toBe('name,age\nAlice,30\nBob,25')
  })

  it('uses provided columns order', () => {
    const rows = [{ a: 1, b: 2, c: 3 }]
    expect(toCsv(rows, ['c', 'a', 'b'])).toBe('c,a,b\n3,1,2')
  })

  it('quotes values containing commas', () => {
    const rows = [{ name: 'Doe, John', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Doe, John",30')
  })

  it('quotes values containing double quotes', () => {
    const rows = [{ name: 'Say "Hello"', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Say ""Hello""",30')
  })

  it('quotes values containing newlines', () => {
    const rows = [{ name: 'Line1\nLine2', age: 30 }]
    expect(toCsv(rows)).toBe('name,age\n"Line1\nLine2",30')
  })

  it('handles numeric values', () => {
    const rows = [{ x: 1, y: 2.5, z: -3 }]
    expect(toCsv(rows)).toBe('x,y,z\n1,2.5,-3')
  })

  it('handles single row', () => {
    const rows = [{ name: 'Alice' }]
    expect(toCsv(rows)).toBe('name\nAlice')
  })

  it('handles single column', () => {
    const rows = [{ name: 'Alice' }, { name: 'Bob' }]
    expect(toCsv(rows, ['name'])).toBe('name\nAlice\nBob')
  })

  it('escapes double quotes by doubling them', () => {
    const rows = [{ name: 'A "B" C' }]
    expect(toCsv(rows)).toBe('name\n"A ""B"" C"')
  })

  it('handles values with multiple special characters', () => {
    const rows = [{ name: 'Hello, "World"\n123' }]
    expect(toCsv(rows)).toBe('name\n"Hello, ""World""\n123"')
  })

  it('uses column order from first row when columns not provided', () => {
    const rows = [{ z: 1, a: 2, m: 3 }]
    expect(toCsv(rows)).toBe('z,a,m\n1,2,3')
  })

  it('handles empty columns array', () => {
    const rows = [{ name: 'Alice' }]
    expect(toCsv(rows, [])).toBe('\n')
  })

  it('handles all types of special characters in one value', () => {
    const rows = [{ value: 'a,b\nc"d' }]
    expect(toCsv(rows)).toBe('value\n"a,b\nc""d"')
  })
})