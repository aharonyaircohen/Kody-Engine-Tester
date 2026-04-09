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

  describe('cache miss', () => {
    it('calls fn once and returns the result', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      const result = await withCache('key', 1000, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('second call returns cached value', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      const result1 = await withCache('key', 1000, fn)
      const result2 = await withCache('key', 1000, fn)
      expect(result1).toBe(42)
      expect(result2).toBe(42)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('TTL expiry', () => {
    it('returns cached value before TTL expires', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      await withCache('key', 1000, fn)
      vi.advanceTimersByTime(999)
      const result = await withCache('key', 1000, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('calls fn again after TTL expires', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      await withCache('key', 1000, fn)
      vi.advanceTimersByTime(1001)
      const result = await withCache('key', 1000, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('different TTL values expire independently', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      await withCache('key', 500, fn)
      vi.advanceTimersByTime(501)
      const result = await withCache('key', 500, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('cache hit', () => {
    it('fn called only once across multiple invocations', async () => {
      const fn = vi.fn().mockResolvedValue('hit')
      await withCache('key', 5000, fn)
      await withCache('key', 5000, fn)
      await withCache('key', 5000, fn)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('concurrent calls (request coalescing)', () => {
    it('while fn is pending, all waiters share same promise', async () => {
      let resolve: (value: number) => void
      const promise = new Promise<number>((r) => {
        resolve = r
      })
      const fn = vi.fn().mockReturnValue(promise)

      const p1 = withCache('key', 1000, fn)
      const p2 = withCache('key', 1000, fn)

      expect(fn).toHaveBeenCalledTimes(1)

      resolve!(42)

      const [r1, r2] = await Promise.all([p1, p2])
      expect(r1).toBe(42)
      expect(r2).toBe(42)
    })

    it('subsequent calls after pending share same result', async () => {
      let resolve: (value: number) => void
      const promise = new Promise<number>((r) => {
        resolve = r
      })
      const fn = vi.fn().mockReturnValue(promise)

      const p1 = withCache('key', 1000, fn)
      vi.advanceTimersByTime(10)
      const p2 = withCache('key', 1000, fn)

      expect(fn).toHaveBeenCalledTimes(1)

      resolve!(42)
      await p1
      await p2

      const result = await withCache('key', 1000, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('different keys', () => {
    it('independent caches for different keys', async () => {
      const fn = vi.fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)

      const r1 = await withCache('a', 5000, fn)
      const r2 = await withCache('b', 5000, fn)
      const r3 = await withCache('c', 5000, fn)

      expect(r1).toBe(1)
      expect(r2).toBe(2)
      expect(r3).toBe(3)
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('error handling', () => {
    it('errors are not cached - fn called again after error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(42)

      await expect(withCache('key', 5000, fn)).rejects.toThrow('fail')
      const result = await withCache('key', 5000, fn)
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('pending promise error propagates to all waiters', async () => {
      let reject: (error: Error) => void
      const promise = new Promise<number>((_, r) => {
        reject = r
      })
      const fn = vi.fn().mockReturnValue(promise)

      const p1 = withCache('key', 1000, fn)
      const p2 = withCache('key', 1000, fn)

      const error = new Error('fail')
      reject!(error)

      await expect(p1).rejects.toThrow('fail')
      await expect(p2).rejects.toThrow('fail')
    })
  })

  describe('module-level cache isolation', () => {
    it('cache is shared across calls with same module instance', async () => {
      const fn = vi.fn().mockResolvedValue(99)
      await withCache('shared-key', 10000, fn)
      const result = await withCache('shared-key', 10000, fn)
      expect(result).toBe(99)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})