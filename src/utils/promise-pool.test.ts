import { describe, it, expect, vi } from 'vitest'
import { PromisePool } from './promise-pool'

describe('PromisePool', () => {
  it('runs all tasks and returns results in addition order', async () => {
    const pool = PromisePool.create<number>({ concurrency: 2 })
    pool.add(() => Promise.resolve(1))
    pool.add(() => Promise.resolve(2))
    pool.add(() => Promise.resolve(3))

    await pool.run()

    expect(pool.results).toEqual([1, 2, 3])
    expect(pool.errors).toEqual([])
  })

  it('respects concurrency limit', async () => {
    let active = 0
    let maxActive = 0
    const concurrency = 2

    const task = () =>
      new Promise<void>((resolve) => {
        active++
        maxActive = Math.max(maxActive, active)
        setTimeout(() => {
          active--
          resolve()
        }, 10)
      })

    const pool = PromisePool.create<void>({ concurrency })
    for (let i = 0; i < 5; i++) pool.add(task)

    await pool.run()

    expect(maxActive).toBeLessThanOrEqual(concurrency)
  })

  it('collects errors with correct index and continues running', async () => {
    const pool = PromisePool.create<number>({ concurrency: 2 })
    pool.add(() => Promise.resolve(1))
    pool.add(() => Promise.reject(new Error('task 2 failed')))
    pool.add(() => Promise.resolve(3))

    await pool.run()

    expect(pool.results[0]).toBe(1)
    expect(pool.results[2]).toBe(3)
    expect(pool.errors).toHaveLength(1)
    expect(pool.errors[0].index).toBe(1)
    expect(pool.errors[0].error.message).toBe('task 2 failed')
  })

  it('wraps non-Error rejections in Error', async () => {
    const pool = PromisePool.create<number>({ concurrency: 1 })
    pool.add(() => Promise.reject('string error'))

    await pool.run()

    expect(pool.errors[0].error).toBeInstanceOf(Error)
    expect(pool.errors[0].error.message).toBe('string error')
  })

  it('preserves result ordering regardless of completion order', async () => {
    const delays = [30, 10, 20]
    const pool = PromisePool.create<number>({ concurrency: 3 })

    delays.forEach((delay, i) => {
      pool.add(
        () =>
          new Promise<number>((resolve) => {
            setTimeout(() => resolve(i), delay)
          })
      )
    })

    await pool.run()

    expect(pool.results).toEqual([0, 1, 2])
  })

  it('calls onProgress with correct values', async () => {
    const progress = vi.fn()
    const pool = PromisePool.create<number>({ concurrency: 1, onProgress: progress })
    pool.add(() => Promise.resolve(1))
    pool.add(() => Promise.resolve(2))
    pool.add(() => Promise.resolve(3))

    await pool.run()

    expect(progress).toHaveBeenCalledTimes(3)
    expect(progress).toHaveBeenNthCalledWith(1, { completed: 1, total: 3, active: 0 })
    expect(progress).toHaveBeenNthCalledWith(2, { completed: 2, total: 3, active: 0 })
    expect(progress).toHaveBeenNthCalledWith(3, { completed: 3, total: 3, active: 0 })
  })

  it('reports active count in progress callback', async () => {
    const progressValues: number[] = []
    const pool = PromisePool.create<void>({
      concurrency: 3,
      onProgress: ({ active }) => progressValues.push(active),
    })

    for (let i = 0; i < 3; i++) {
      pool.add(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 10)
          })
      )
    }

    await pool.run()

    expect(progressValues.every((v) => v >= 0)).toBe(true)
  })

  it('handles an empty pool', async () => {
    const pool = PromisePool.create<number>({ concurrency: 2 })
    await pool.run()

    expect(pool.results).toEqual([])
    expect(pool.errors).toEqual([])
  })

  it('handles concurrency greater than task count', async () => {
    const pool = PromisePool.create<number>({ concurrency: 10 })
    pool.add(() => Promise.resolve(42))

    await pool.run()

    expect(pool.results).toEqual([42])
  })

  it('returns the pool instance from run() for chaining', async () => {
    const pool = PromisePool.create<number>({ concurrency: 1 })
    pool.add(() => Promise.resolve(1))

    const result = await pool.run()

    expect(result).toBe(pool)
  })

  it('supports chaining add() calls', async () => {
    const pool = PromisePool.create<number>({ concurrency: 2 })
    pool.add(() => Promise.resolve(1)).add(() => Promise.resolve(2)).add(() => Promise.resolve(3))

    await pool.run()

    expect(pool.results).toEqual([1, 2, 3])
  })
})
