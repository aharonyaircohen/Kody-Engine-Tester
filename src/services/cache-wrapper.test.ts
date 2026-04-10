import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns cached value on cache hit', async () => {
    const fn = vi.fn().mockResolvedValue('fresh')
    const result1 = await withCache('key1', 1000, fn)
    const result2 = await withCache('key1', 1000, fn)

    expect(result1).toBe('fresh')
    expect(result2).toBe('fresh')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls fn and caches result on cache miss', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    const result = await withCache('key2', 1000, fn)

    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('returns cached value before TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue('value')
    await withCache('key3', 1000, fn)

    vi.advanceTimersByTime(999)
    const result = await withCache('key3', 1000, fn)

    expect(result).toBe('value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls fn again after TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue('value')
    await withCache('key4', 1000, fn)

    vi.advanceTimersByTime(1001)
    const result = await withCache('key4', 1000, fn)

    expect(result).toBe('value')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('returns different cached values for different keys', async () => {
    const fnA = vi.fn().mockResolvedValue('A')
    const fnB = vi.fn().mockResolvedValue('B')

    const resultA = await withCache('keyA', 1000, fnA)
    const resultB = await withCache('keyB', 1000, fnB)

    expect(resultA).toBe('A')
    expect(resultB).toBe('B')
  })

  it('works with different TTL values per call', async () => {
    const fn = vi.fn().mockResolvedValue('value')
    await withCache('key5', 2000, fn)

    vi.advanceTimersByTime(1500)
    expect(await withCache('key5', 2000, fn)).toBe('value')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(600)
    expect(await withCache('key5', 500, fn)).toBe('value')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
