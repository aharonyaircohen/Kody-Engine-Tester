import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
    vi.useFakeTimers()
  })

  it('should return cached value when not expired', async () => {
    const fn = vi.fn().mockResolvedValue('result')
    const result1 = await withCache('key1', 5000, fn)
    const result2 = await withCache('key1', 5000, fn)

    expect(result1).toBe('result')
    expect(result2).toBe('result')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call fn and cache result when key not in cache', async () => {
    const fn = vi.fn().mockResolvedValue('fresh')

    const result = await withCache('new-key', 5000, fn)

    expect(result).toBe('fresh')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should return cached value before TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue('data')
    await withCache('ttl-key', 10000, fn)

    vi.advanceTimersByTime(5000)

    const result = await withCache('ttl-key', 10000, fn)
    expect(result).toBe('data')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call fn again after TTL expires', async () => {
    const fn = vi.fn().mockResolvedValue('data')
    await withCache('expire-key', 5000, fn)

    vi.advanceTimersByTime(5000)

    const result = await withCache('expire-key', 5000, fn)
    expect(result).toBe('data')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should cache null values', async () => {
    const fn = vi.fn().mockResolvedValue(null)

    const result1 = await withCache('null-key', 5000, fn)
    const result2 = await withCache('null-key', 5000, fn)

    expect(result1).toBe(null)
    expect(result2).toBe(null)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should cache undefined values', async () => {
    const fn = vi.fn().mockResolvedValue(undefined)

    const result1 = await withCache('undef-key', 5000, fn)
    const result2 = await withCache('undef-key', 5000, fn)

    expect(result1).toBe(undefined)
    expect(result2).toBe(undefined)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should handle different keys independently', async () => {
    const fn1 = vi.fn().mockResolvedValue('value1')
    const fn2 = vi.fn().mockResolvedValue('value2')

    const result1 = await withCache('key-a', 5000, fn1)
    const result2 = await withCache('key-b', 5000, fn2)

    expect(result1).toBe('value1')
    expect(result2).toBe('value2')
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should handle object values', async () => {
    const fn = vi.fn().mockResolvedValue({ nested: { data: 123 } })

    const result1 = await withCache('obj-key', 5000, fn)
    const result2 = await withCache('obj-key', 5000, fn)

    expect(result1).toEqual({ nested: { data: 123 } })
    expect(result2).toEqual({ nested: { data: 123 } })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not cache rejections', async () => {
    const errorFn = vi.fn().mockRejectedValue(new Error('oops'))

    await expect(withCache('error-key', 5000, errorFn)).rejects.toThrow('oops')

    const errorFn2 = vi.fn().mockResolvedValue('recovered')
    const result = await withCache('error-key', 5000, errorFn2)
    expect(result).toBe('recovered')
    expect(errorFn2).toHaveBeenCalledTimes(1)
  })
})

describe('clearCache', () => {
  it('should clear all cached entries', async () => {
    const fn = vi.fn().mockResolvedValue('cached-data')
    await withCache('key-to-clear', 5000, fn)

    clearCache()

    const result = await withCache('key-to-clear', 5000, fn)
    expect(result).toBe('cached-data')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
