import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    clearCache()
  })

  it('returns the result of the function', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    const result = await withCache('key', 1000, fn)
    expect(result).toBe(42)
  })

  it('calls the function only once for the same key', async () => {
    const fn = vi.fn().mockResolvedValue('hello')
    await withCache('key', 1000, fn)
    await withCache('key', 1000, fn)
    await withCache('key', 1000, fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls the function again after TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue('hello')
    await withCache('key', 50, fn)
    await new Promise((resolve) => setTimeout(resolve, 60))
    await withCache('key', 50, fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('calls the function for different keys', async () => {
    const fn = vi.fn().mockResolvedValue('value')
    await withCache('key1', 1000, fn)
    await withCache('key2', 1000, fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('returns cached value before TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue({ count: 0 })
    const result1 = await withCache('key', 1000, fn)
    const result2 = await withCache('key', 1000, fn)
    expect(result1).toBe(result2)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('works with non-promise functions wrapped in Promise.resolve', async () => {
    const fn = vi.fn().mockReturnValue(42)
    const result = await withCache('key', 1000, async () => fn())
    expect(result).toBe(42)
  })

  it('handles errors from the wrapped function', async () => {
    const error = new Error('test error')
    const fn = vi.fn().mockRejectedValue(error)
    await expect(withCache('key', 1000, fn)).rejects.toThrow('test error')
  })
})
