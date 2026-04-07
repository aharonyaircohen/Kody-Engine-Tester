import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns cached value on cache hit', async () => {
    const fn = vi.fn().mockResolvedValue('fresh value')

    const result1 = withCache('key1', 1000, fn)
    await vi.advanceTimersByTimeAsync(0)
    expect(await result1).toBe('fresh value')
    expect(fn).toHaveBeenCalledTimes(1)

    const result2 = withCache('key1', 1000, fn)
    await vi.advanceTimersByTimeAsync(0)
    expect(await result2).toBe('fresh value')
    expect(fn).toHaveBeenCalledTimes(1) // function not called again
  })

  it('calls function and caches result on cache miss', async () => {
    const fn = vi.fn().mockResolvedValue('computed value')

    const result = withCache('miss-key', 1000, fn)
    await vi.advanceTimersByTimeAsync(0)
    expect(await result).toBe('computed value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not share cache across different keys', async () => {
    const fn1 = vi.fn().mockResolvedValue('value1')
    const fn2 = vi.fn().mockResolvedValue('value2')

    const result1 = withCache('key-a', 1000, fn1)
    await vi.advanceTimersByTimeAsync(0)
    const result2 = withCache('key-b', 1000, fn2)
    await vi.advanceTimersByTimeAsync(0)

    expect(await result1).toBe('value1')
    expect(await result2).toBe('value2')
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  describe('TTL expiry', () => {
    it('returns cached value before TTL expires', async () => {
      const fn = vi.fn().mockResolvedValue('cached')

      const result1 = withCache('ttl-key', 5000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result1).toBe('cached')

      vi.advanceTimersByTime(4999)

      const result2 = withCache('ttl-key', 5000, fn)
      expect(await result2).toBe('cached')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('re-executes function after TTL expires', async () => {
      const fn = vi.fn().mockResolvedValue('original')

      const result1 = withCache('expiry-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result1).toBe('original')

      vi.advanceTimersByTime(1001)

      const result2 = withCache('expiry-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('original')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('returns fresh value after expiry even when previous value was cached', async () => {
      const fn = vi.fn().mockResolvedValue('stale')

      const result1 = withCache('stale-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result1).toBe('stale')

      vi.advanceTimersByTime(1001)

      fn.mockResolvedValueOnce('fresh')
      const result2 = withCache('stale-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('fresh')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('re-throws error from the wrapped function', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('function error'))

      const result = withCache('error-key', 1000, fn)
      result.catch(() => {}) // suppress unhandled rejection
      await vi.advanceTimersByTimeAsync(0)

      await expect(result).rejects.toThrow('function error')
    })

    it('does not cache errors', async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error('first error')).mockResolvedValueOnce('success')

      const result1 = withCache('error-cache-key', 1000, fn)
      result1.catch(() => {}) // suppress unhandled rejection
      await vi.advanceTimersByTimeAsync(0)

      try {
        await result1
      } catch {
        // expected
      }

      const result2 = withCache('error-cache-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('retries function after an error and then success', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('recovered')

      const result1 = withCache('retry-key', 1000, fn)
      result1.catch(() => {}) // suppress unhandled rejection
      await vi.advanceTimersByTimeAsync(0)

      await expect(result1).rejects.toThrow('fail')

      const result2 = withCache('retry-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('recovered')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('concurrent calls', () => {
    it('only calls function once for concurrent requests with same key', async () => {
      const fn = vi.fn().mockResolvedValue('shared')

      const [result1, result2, result3] = [
        withCache('concurrent-key', 1000, fn),
        withCache('concurrent-key', 1000, fn),
        withCache('concurrent-key', 1000, fn),
      ]

      await vi.advanceTimersByTimeAsync(0)

      const [r1, r2, r3] = await Promise.all([result1, result2, result3])
      expect(r1).toBe('shared')
      expect(r2).toBe('shared')
      expect(r3).toBe('shared')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearCache', () => {
    it('clears all cached entries', async () => {
      const fn = vi.fn().mockResolvedValue('cached')

      const result1 = withCache('clear-key', 10000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result1).toBe('cached')

      clearCache()

      const result2 = withCache('clear-key', 10000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('cached')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('type safety', () => {
    it('returns correct type for string values', async () => {
      const fn = vi.fn<() => Promise<string>>().mockResolvedValue('string result')

      const result = withCache('type-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)

      expect(await result).toBe('string result')
    })

    it('returns correct type for object values', async () => {
      const fn = vi.fn<() => Promise<{ id: number; name: string }>>().mockResolvedValue({ id: 1, name: 'test' })

      const result = withCache('obj-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)

      expect(await result).toEqual({ id: 1, name: 'test' })
    })

    it('returns correct type for number values', async () => {
      const fn = vi.fn<() => Promise<number>>().mockResolvedValue(42)

      const result = withCache('num-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)

      expect(await result).toBe(42)
    })
  })

  describe('edge cases', () => {
    it('handles zero TTL as immediate expiry', async () => {
      const fn = vi.fn().mockResolvedValue('zero ttl')

      const result1 = withCache('zero-key', 0, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result1).toBe('zero ttl')

      vi.advanceTimersByTime(1)

      const result2 = withCache('zero-key', 0, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result2).toBe('zero ttl')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('handles very large TTL', async () => {
      const fn = vi.fn().mockResolvedValue('large ttl')

      const result = withCache('large-key', Number.MAX_SAFE_INTEGER, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result).toBe('large ttl')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles null as a valid cached value', async () => {
      const fn = vi.fn().mockResolvedValue(null)

      const result = withCache('null-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result).toBe(null)
    })

    it('handles undefined as a valid cached value', async () => {
      const fn = vi.fn().mockResolvedValue(undefined)

      const result = withCache('undef-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result).toBe(undefined)
    })

    it('handles empty string as a valid cached value', async () => {
      const fn = vi.fn().mockResolvedValue('')

      const result = withCache('empty-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result).toBe('')
    })

    it('handles numeric zero as a valid cached value', async () => {
      const fn = vi.fn().mockResolvedValue(0)

      const result = withCache('zero-val-key', 1000, fn)
      await vi.advanceTimersByTimeAsync(0)
      expect(await result).toBe(0)
    })
  })
})
