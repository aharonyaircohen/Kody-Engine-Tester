import { describe, it, expect } from 'vitest'
import { groupBy } from './group-by'

describe('groupBy', () => {
  it('groups strings by length', () => {
    const result = groupBy(['one', 'two', 'three', 'four'], (s) => String(s.length))
    expect(result).toEqual({
      '3': ['one', 'two'],
      '5': ['three'],
      '4': ['four'],
    })
  })

  it('groups objects by a property', () => {
    const items = [
      { name: 'Alice', dept: 'eng' },
      { name: 'Bob', dept: 'sales' },
      { name: 'Carol', dept: 'eng' },
    ]
    const result = groupBy(items, (item) => item.dept)
    expect(result).toEqual({
      eng: [{ name: 'Alice', dept: 'eng' }, { name: 'Carol', dept: 'eng' }],
      sales: [{ name: 'Bob', dept: 'sales' }],
    })
  })

  it('returns empty object for empty array', () => {
    expect(groupBy([], (x) => String(x))).toEqual({})
  })

  it('puts all items in one group when key function returns same value', () => {
    const result = groupBy([1, 2, 3], () => 'all')
    expect(result).toEqual({ all: [1, 2, 3] })
  })

  it('creates a separate group for each unique item', () => {
    const result = groupBy([1, 2, 3], (n) => String(n))
    expect(result).toEqual({ '1': [1], '2': [2], '3': [3] })
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    groupBy(arr, (n) => String(n))
    expect(arr).toEqual([1, 2, 3])
  })

  it('converts numeric keys to strings', () => {
    const result = groupBy([10, 20, 10], (n) => String(n))
    expect(result['10']).toEqual([10, 10])
    expect(result['20']).toEqual([20])
  })

  it('preserves insertion order within groups', () => {
    const result = groupBy(['b', 'a', 'b', 'c', 'a'], (s) => s)
    expect(result['b']).toEqual(['b', 'b'])
    expect(result['a']).toEqual(['a', 'a'])
    expect(result['c']).toEqual(['c'])
  })
})
