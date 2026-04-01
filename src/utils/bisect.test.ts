import { describe, it, expect } from 'vitest'
import { bisectLeft, bisectRight, insort } from './bisect'

describe('bisectLeft', () => {
  it('returns 0 for empty array', () => {
    expect(bisectLeft([], 5)).toBe(0)
  })

  it('returns 0 when value is less than all elements', () => {
    expect(bisectLeft([3, 5, 7], 1)).toBe(0)
  })

  it('returns length when value is greater than all elements', () => {
    expect(bisectLeft([3, 5, 7], 10)).toBe(3)
  })

  it('returns correct position for value between elements', () => {
    expect(bisectLeft([1, 3, 5, 7], 4)).toBe(2)
  })

  it('returns leftmost position for duplicate values', () => {
    expect(bisectLeft([1, 3, 3, 3, 5], 3)).toBe(1)
  })

  it('returns 0 for value equal to first element', () => {
    expect(bisectLeft([3, 5, 7], 3)).toBe(0)
  })

  it('works with strings', () => {
    expect(bisectLeft(['a', 'c', 'e'], 'b')).toBe(1)
    expect(bisectLeft(['a', 'c', 'e'], 'd')).toBe(2)
  })

  it('works with custom comparator for objects', () => {
    const arr = [{ x: 1 }, { x: 3 }, { x: 5 }]
    const comparator = (a: { x: number }, b: { x: number }) => a.x - b.x
    expect(bisectLeft(arr, { x: 4 }, comparator)).toBe(2)
    expect(bisectLeft(arr, { x: 0 }, comparator)).toBe(0)
  })

  it('custom comparator is called correctly', () => {
    const calls: [number, number][] = []
    const comparator = (a: number, b: number) => {
      calls.push([a, b])
      return a - b
    }
    bisectLeft([1, 2, 3], 2, comparator)
    expect(calls.length).toBeGreaterThan(0)
  })
})

describe('bisectRight', () => {
  it('returns 0 for empty array', () => {
    expect(bisectRight([], 5)).toBe(0)
  })

  it('returns 0 when value is less than all elements', () => {
    expect(bisectRight([3, 5, 7], 1)).toBe(0)
  })

  it('returns length when value is greater than all elements', () => {
    expect(bisectRight([3, 5, 7], 10)).toBe(3)
  })

  it('returns correct position for value between elements', () => {
    expect(bisectRight([1, 3, 5, 7], 4)).toBe(2)
  })

  it('returns position after last duplicate for duplicate values', () => {
    expect(bisectRight([1, 3, 3, 3, 5], 3)).toBe(4)
  })

  it('returns position after first element when equal', () => {
    expect(bisectRight([3, 5, 7], 3)).toBe(1)
  })

  it('works with strings', () => {
    expect(bisectRight(['a', 'c', 'e'], 'b')).toBe(1)
    expect(bisectRight(['a', 'c', 'e'], 'd')).toBe(2)
  })

  it('works with custom comparator for objects', () => {
    const arr = [{ x: 1 }, { x: 3 }, { x: 5 }]
    const comparator = (a: { x: number }, b: { x: number }) => a.x - b.x
    expect(bisectRight(arr, { x: 3 }, comparator)).toBe(2)
    expect(bisectRight(arr, { x: 0 }, comparator)).toBe(0)
  })
})

describe('insort', () => {
  it('inserts into empty array', () => {
    const arr: number[] = []
    expect(insort(arr, 5)).toBe(0)
    expect(arr).toEqual([5])
  })

  it('inserts at beginning', () => {
    const arr = [3, 5, 7]
    expect(insort(arr, 1)).toBe(0)
    expect(arr).toEqual([1, 3, 5, 7])
  })

  it('inserts at end', () => {
    const arr = [3, 5, 7]
    expect(insort(arr, 10)).toBe(3)
    expect(arr).toEqual([3, 5, 7, 10])
  })

  it('inserts in middle', () => {
    const arr = [1, 3, 5, 7]
    expect(insort(arr, 4)).toBe(2)
    expect(arr).toEqual([1, 3, 4, 5, 7])
  })

  it('inserts duplicate to the right', () => {
    const arr = [1, 3, 3, 3, 5]
    expect(insort(arr, 3)).toBe(4)
    expect(arr).toEqual([1, 3, 3, 3, 3, 5])
  })

  it('modifies array in place', () => {
    const arr = [1, 2, 3]
    insort(arr, 1.5)
    expect(arr).toEqual([1, 1.5, 2, 3])
  })

  it('works with custom comparator', () => {
    const arr = [{ x: 1 }, { x: 3 }, { x: 5 }]
    const comparator = (a: { x: number }, b: { x: number }) => a.x - b.x
    expect(insort(arr, { x: 4 }, comparator)).toBe(2)
    expect(arr).toEqual([{ x: 1 }, { x: 3 }, { x: 4 }, { x: 5 }])
  })
})
