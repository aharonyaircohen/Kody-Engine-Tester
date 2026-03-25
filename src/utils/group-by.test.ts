import { describe, it, expect } from 'vitest'
import { groupBy } from './group-by'

describe('groupBy', () => {
  it('should group items by string key function', () => {
    const items = ['one', 'two', 'three', 'four']
    expect(groupBy(items, (s) => String(s.length))).toEqual({
      '3': ['one', 'two'],
      '4': ['four'],
      '5': ['three'],
    })
  })

  it('should group objects by a property key function', () => {
    const items = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ]
    expect(groupBy(items, (x) => x.type)).toEqual({
      a: [{ type: 'a', val: 1 }, { type: 'a', val: 3 }],
      b: [{ type: 'b', val: 2 }],
    })
  })

  it('should return an empty object for an empty array', () => {
    expect(groupBy([], (x) => String(x))).toEqual({})
  })

  it('should handle all items falling into a single group', () => {
    expect(groupBy([1, 2, 3], () => 'same')).toEqual({ same: [1, 2, 3] })
  })

  it('should handle each item in its own group', () => {
    expect(groupBy([1, 2, 3], (x) => String(x))).toEqual({
      '1': [1],
      '2': [2],
      '3': [3],
    })
  })

  it('should not mutate the original array', () => {
    const items = [1, 2, 3]
    groupBy(items, (x) => String(x))
    expect(items).toEqual([1, 2, 3])
  })

  it('should handle numeric keys converted to strings', () => {
    const items = [{ age: 25 }, { age: 30 }, { age: 25 }]
    expect(groupBy(items, (x) => String(x.age))).toEqual({
      '25': [{ age: 25 }, { age: 25 }],
      '30': [{ age: 30 }],
    })
  })

  it('should preserve insertion order within groups', () => {
    const items = ['c', 'a', 'b', 'a', 'c']
    const result = groupBy(items, (x) => x)
    expect(result['a']).toEqual(['a', 'a'])
    expect(result['c']).toEqual(['c', 'c'])
    expect(result['b']).toEqual(['b'])
  })
})
