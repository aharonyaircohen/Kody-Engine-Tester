import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the function result on first call', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    const result = await withCache('key', 1000, fn)
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('returns cached value on subsequent calls within TTL', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    await withCache('key', 1000, fn)
    await withCache('key', 1000, fn)
    await withCache('key', 1000, fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls function again after TTL expires', async () => {
    vi.useFakeTimers()
    const fn = vi.fn().mockResolvedValue(42)
    await withCache('key', 1000, fn)
    vi.advanceTimersByTime(1001)
    const result = await withCache('key', 1000, fn)
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('returns cached value before TTL expires', async () => {
    vi.useFakeTimers()
    const fn = vi.fn().mockResolvedValue(42)
    await withCache('key', 1000, fn)
    vi.advanceTimersByTime(999)
    await withCache('key', 1000, fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('returns undefined/null cached values correctly', async () => {
    const fn = vi.fn().mockResolvedValue(null)
    const fn2 = vi.fn().mockResolvedValue(undefined)

    const result1 = await withCache('null-key', 1000, fn)
    const result2 = await withCache('undefined-key', 1000, fn2)

    expect(result1).toBe(null)
    expect(result2).toBe(undefined)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('handles different keys independently', async () => {
    const fnA = vi.fn().mockResolvedValue('a')
    const fnB = vi.fn().mockResolvedValue('b')

    const resultA = await withCache('key-a', 1000, fnA)
    const resultB = await withCache('key-b', 1000, fnB)

    expect(resultA).toBe('a')
    expect(resultB).toBe('b')
    expect(fnA).toHaveBeenCalledTimes(1)
    expect(fnB).toHaveBeenCalledTimes(1)
  })

  it('handles rejected promises', async () => {
    const error = new Error('test error')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(withCache('key', 1000, fn)).rejects.toThrow('test error')
    await expect(withCache('key', 1000, fn)).rejects.toThrow('test error')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('clearCache', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears all cached entries', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    await withCache('key1', 1000, fn)
    await withCache('key2', 1000, fn)
    clearCache()
    await withCache('key1', 1000, fn)
    await withCache('key2', 1000, fn)
    expect(fn).toHaveBeenCalledTimes(4)
  })
})
