import { describe, it, expect } from 'vitest'
import { parseCsv } from './csv'

describe('parseCsv', () => {
  it('returns empty array for empty string', () => {
    expect(parseCsv('')).toEqual([])
  })

  it('handles single row', () => {
    expect(parseCsv('a,b,c')).toEqual([['a', 'b', 'c']])
  })

  it('handles multiple rows', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('handles trailing newline', () => {
    expect(parseCsv('a,b\n')).toEqual([['a', 'b']])
  })

  it('handles empty field (a,,b)', () => {
    expect(parseCsv('a,,b')).toEqual([['a', '', 'b']])
  })

  it('trims whitespace from fields', () => {
    expect(parseCsv('  a  ,  b  ,  c  ')).toEqual([['a', 'b', 'c']])
  })
})
