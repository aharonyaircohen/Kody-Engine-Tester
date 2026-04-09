import { describe, it, expect, beforeEach } from 'vitest'
import { withCache, clearCache } from './cache-wrapper'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
  })

  it('calls fn and caches result on first call', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      return 'result'
    }

    const result = await withCache('key1', 1000, fn)
    expect(result).toBe('result')
    expect(callCount).toBe(1)
  })

  it('returns cached value without calling fn within TTL', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      return 'result'
    }

    await withCache('key2', 1000, fn)
    await withCache('key2', 1000, fn)
    await withCache('key2', 1000, fn)

    expect(callCount).toBe(1)
  })

  it('returns different values for different keys', async () => {
    const fnA = async () => 'A'
    const fnB = async () => 'B'

    const resultA = await withCache('key-a', 1000, fnA)
    const resultB = await withCache('key-b', 1000, fnB)

    expect(resultA).toBe('A')
    expect(resultB).toBe('B')
  })

  it('re-calls fn after TTL expires', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      return callCount
    }

    await withCache('key3', 50, fn)
    expect(callCount).toBe(1)

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 70))

    await withCache('key3', 50, fn)
    expect(callCount).toBe(2)
  })

  it('works with different result types', async () => {
    const fn = async () => ({ name: 'test', score: 42 })

    const result = await withCache('obj-key', 1000, fn)
    expect(result).toEqual({ name: 'test', score: 42 })
  })

  it('works with array results', async () => {
    const fn = async () => [1, 2, 3]

    const result = await withCache('arr-key', 1000, fn)
    expect(result).toEqual([1, 2, 3])
  })
})

describe('clearCache', () => {
  beforeEach(() => {
    clearCache()
  })

  it('clears a specific key', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      return 'value'
    }

    await withCache('clear-key', 10000, fn)
    expect(callCount).toBe(1)

    clearCache('clear-key')

    await withCache('clear-key', 10000, fn)
    expect(callCount).toBe(2)
  })

  it('clears all keys when called without arguments', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      return 'value'
    }

    await withCache('key1', 10000, fn)
    await withCache('key2', 10000, fn)
    expect(callCount).toBe(2)

    clearCache()

    await withCache('key1', 10000, fn)
    await withCache('key2', 10000, fn)
    expect(callCount).toBe(4)
  })

  it('does not throw for non-existent key', () => {
    expect(() => clearCache('nonexistent')).not.toThrow()
  })
})
