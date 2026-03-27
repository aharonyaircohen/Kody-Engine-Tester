import { describe, it, expect, vi } from 'vitest'
import { memoize } from './memoize'

describe('memoize', () => {
  it('returns the correct result', () => {
    const fn = (x: number) => x * 2
    const memoized = memoize(fn)
    expect(memoized(5)).toBe(10)
  })

  it('caches results for the same single argument', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    memoized(3)
    memoized(3)
    memoized(3)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('caches separately for different arguments', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(1)).toBe(2)
    expect(memoized(2)).toBe(4)
    expect(memoized(1)).toBe(2)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('supports multi-argument functions', () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const memoized = memoize(fn)

    expect(memoized(1, 2)).toBe(3)
    expect(memoized(1, 2)).toBe(3)
    expect(memoized(2, 1)).toBe(3)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('distinguishes cache keys for different argument combinations', () => {
    const fn = vi.fn((a: string, b: string) => a + b)
    const memoized = memoize(fn)

    memoized('foo', 'bar')
    memoized('foobar', '')
    memoized('foo', 'bar')

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('foo', 'bar')
    expect(fn).toHaveBeenCalledWith('foobar', '')
  })

  it('clears the cache with clear()', () => {
    const fn = vi.fn((x: number) => x * 3)
    const memoized = memoize(fn)

    memoized(4)
    expect(fn).toHaveBeenCalledTimes(1)

    memoized.clear()

    memoized(4)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('continues to work correctly after clear()', () => {
    const fn = vi.fn((x: number) => x + 1)
    const memoized = memoize(fn)

    expect(memoized(10)).toBe(11)
    memoized.clear()
    expect(memoized(10)).toBe(11)
    expect(memoized(10)).toBe(11)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works with no arguments', () => {
    let count = 0
    const fn = vi.fn(() => ++count)
    const memoized = memoize(fn)

    expect(memoized()).toBe(1)
    expect(memoized()).toBe(1)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('works with object arguments', () => {
    const fn = vi.fn((obj: { x: number }) => obj.x * 2)
    const memoized = memoize(fn)

    expect(memoized({ x: 5 })).toBe(10)
    expect(memoized({ x: 5 })).toBe(10)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
