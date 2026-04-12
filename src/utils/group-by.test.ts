import { describe, it, expect } from 'vitest'
import { groupBy } from './group-by'

describe('groupBy', () => {
  it('returns empty object for empty array', () => {
    expect(groupBy([] as { name: string }[], (item) => item.name)).toEqual({})
  })

  it('handles single item array', () => {
    const items = [{ name: 'Alice', dept: 'eng' }]
    const result = groupBy(items, (item) => item.dept)
    expect(result).toEqual({ eng: [{ name: 'Alice', dept: 'eng' }] })
  })

  it('groups objects by a property with different key values', () => {
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

  it('does not mutate the original array', () => {
    const arr = [{ dept: 'eng' }, { dept: 'sales' }]
    groupBy(arr, (item) => item.dept)
    expect(arr).toEqual([{ dept: 'eng' }, { dept: 'sales' }])
  })

  it('converts numeric keys to strings', () => {
    const items = [{ n: 10 }, { n: 20 }, { n: 10 }]
    const result = groupBy(items, (item) => String(item.n))
    expect(result['10']).toEqual([{ n: 10 }, { n: 10 }])
    expect(result['20']).toEqual([{ n: 20 }])
  })

  it('preserves insertion order within groups', () => {
    const items = [
      { name: 'first', dept: 'eng' },
      { name: 'second', dept: 'sales' },
      { name: 'third', dept: 'eng' },
    ]
    const result = groupBy(items, (item) => item.dept)
    expect(result['eng']).toEqual([
      { name: 'first', dept: 'eng' },
      { name: 'third', dept: 'eng' },
    ])
    expect(result['sales']).toEqual([{ name: 'second', dept: 'sales' }])
  })

  it('supports dynamic key extraction', () => {
    const items = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Carol', age: 30 },
    ]
    const result = groupBy(items, (item) => String(item.age))
    expect(result['30']).toEqual([{ name: 'Alice', age: 30 }, { name: 'Carol', age: 30 }])
    expect(result['25']).toEqual([{ name: 'Bob', age: 25 }])
  })
})
