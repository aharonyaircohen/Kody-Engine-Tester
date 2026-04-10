import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
    vi.useFakeTimers()
  })

  it('should return the result of calling fn when cache is empty', async () => {
    const fn = vi.fn().mockResolvedValue('result')
    const result = await withCache('key1', 1000, fn)
    expect(result).toBe('result')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should return cached value when within TTL', async () => {
    const fn = vi.fn().mockResolvedValue('fresh')
    await withCache('key1', 5000, fn)
    const result = await withCache('key1', 5000, fn)
    expect(result).toBe('fresh')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call fn again when TTL has expired', async () => {
    const fn = vi.fn().mockResolvedValue('original')
    await withCache('key2', 100, fn)
    vi.advanceTimersByTime(101)
    const result = await withCache('key2', 100, fn)
    expect(result).toBe('original')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should cache different keys independently', async () => {
    const fn1 = vi.fn().mockResolvedValue('value1')
    const fn2 = vi.fn().mockResolvedValue('value2')
    const r1 = await withCache('keyA', 5000, fn1)
    const r2 = await withCache('keyB', 5000, fn2)
    expect(r1).toBe('value1')
    expect(r2).toBe('value2')
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should overwrite expired cache entry on next call', async () => {
    const fn = vi.fn().mockResolvedValue('updated')
    await withCache('key3', 50, fn)
    vi.advanceTimersByTime(51)
    await withCache('key3', 50, fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should work with different return types', async () => {
    const objFn = vi.fn().mockResolvedValue({ id: 1, name: 'test' })
    const numFn = vi.fn().mockResolvedValue(42)
    const arrFn = vi.fn().mockResolvedValue([1, 2, 3])

    const obj = await withCache('objKey', 5000, objFn)
    const num = await withCache('numKey', 5000, numFn)
    const arr = await withCache('arrKey', 5000, arrFn)

    expect(obj).toEqual({ id: 1, name: 'test' })
    expect(num).toBe(42)
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle async functions that reject', async () => {
    const error = new Error('async error')
    const fn = vi.fn().mockRejectedValue(error)
    await expect(withCache('errorKey', 1000, fn)).rejects.toThrow('async error')
  })

  it('should refresh TTL on each call while cached', async () => {
    const fn = vi.fn().mockResolvedValue('cached')
    await withCache('key4', 1000, fn)
    vi.advanceTimersByTime(500)
    await withCache('key4', 1000, fn)
    vi.advanceTimersByTime(500)
    await withCache('key4', 1000, fn)
    vi.advanceTimersByTime(999)
    const result = await withCache('key4', 1000, fn)
    expect(result).toBe('cached')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
