import { describe, it, expect } from 'vitest'
import { partition, partitionAsync } from './partition'

describe('partition', () => {
  it('separates even and odd numbers', () => {
    const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
    expect(evens).toEqual([2, 4])
    expect(odds).toEqual([1, 3, 5])
  })

  it('separates strings by length', () => {
    const [short, long] = partition(['a', 'ab', 'abc', 'abcd'], (s) => s.length <= 2)
    expect(short).toEqual(['a', 'ab'])
    expect(long).toEqual(['abc', 'abcd'])
  })

  it('returns all items in matches when all match predicate', () => {
    const [matches, nonMatches] = partition([1, 2, 3], (n) => n > 0)
    expect(matches).toEqual([1, 2, 3])
    expect(nonMatches).toEqual([])
  })

  it('returns all items in nonMatches when none match predicate', () => {
    const [matches, nonMatches] = partition([1, 2, 3], (n) => n > 10)
    expect(matches).toEqual([])
    expect(nonMatches).toEqual([1, 2, 3])
  })

  it('returns empty arrays for empty input', () => {
    const [matches, nonMatches] = partition<number>([], (n) => n > 0)
    expect(matches).toEqual([])
    expect(nonMatches).toEqual([])
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4]
    partition(arr, (n) => n % 2 === 0)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('preserves order within each group', () => {
    const [, nonMatches] = partition(['c', 'a', 'b', 'd'], (s) => s < 'c')
    expect(nonMatches).toEqual(['c', 'd'])
  })

  it('handles objects with property checks', () => {
    const users = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Carol', active: true },
    ]
    const [active, inactive] = partition(users, (u) => u.active)
    expect(active).toEqual([
      { name: 'Alice', active: true },
      { name: 'Carol', active: true },
    ])
    expect(inactive).toEqual([{ name: 'Bob', active: false }])
  })

  it('works with readonly arrays', () => {
    const readonlyArr: readonly number[] = [1, 2, 3, 4, 5]
    const [matches, nonMatches] = partition(readonlyArr, (n) => n > 3)
    expect(matches).toEqual([4, 5])
    expect(nonMatches).toEqual([1, 2, 3])
  })
})

describe('partitionAsync', () => {
  it('separates numbers by threshold asynchronously', async () => {
    const [above, below] = await partitionAsync([1, 5, 3, 8, 2], async (n) => n > 4)
    expect(above).toEqual([5, 8])
    expect(below).toEqual([1, 3, 2])
  })

  it('returns all items in matches when all match predicate', async () => {
    const [matches, nonMatches] = await partitionAsync([1, 2, 3], async (n) => n > 0)
    expect(matches).toEqual([1, 2, 3])
    expect(nonMatches).toEqual([])
  })

  it('returns all items in nonMatches when none match predicate', async () => {
    const [matches, nonMatches] = await partitionAsync([1, 2, 3], async (n) => n > 10)
    expect(matches).toEqual([])
    expect(nonMatches).toEqual([1, 2, 3])
  })

  it('returns empty arrays for empty input', async () => {
    const [matches, nonMatches] = await partitionAsync<number>([], async (n) => n > 0)
    expect(matches).toEqual([])
    expect(nonMatches).toEqual([])
  })

  it('does not mutate the original array', async () => {
    const arr = [1, 2, 3, 4]
    await partitionAsync(arr, async (n) => n % 2 === 0)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('handles async predicate that resolves to boolean', async () => {
    const items = ['apple', 'banana', 'cherry', 'date']
    const [short, long] = await partitionAsync(items, async (s) => {
      await new Promise((resolve) => setTimeout(resolve, 1))
      return s.length <= 5
    })
    expect(short).toEqual(['apple', 'date'])
    expect(long).toEqual(['banana', 'cherry'])
  })

  it('preserves order within each group', async () => {
    const [matches] = await partitionAsync(['c', 'a', 'b', 'd'], async (s) => s < 'c')
    expect(matches).toEqual(['a', 'b'])
  })

  it('works with mixed types', async () => {
    const items: (string | number)[] = [1, 'a', 2, 'b', 3]
    const [strings, numbers] = await partitionAsync(items, async (item) => typeof item === 'string')
    expect(strings).toEqual(['a', 'b'])
    expect(numbers).toEqual([1, 2, 3])
  })
})
