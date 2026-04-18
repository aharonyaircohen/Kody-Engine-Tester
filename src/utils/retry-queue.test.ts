import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RetryQueue } from './retry-queue'

describe('RetryQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('processes a single item successfully', async () => {
    const queue = new RetryQueue<string>()
    const handler = vi.fn().mockResolvedValue(undefined)

    queue.enqueue('hello', handler)
    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await processPromise

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith('hello')
    expect(queue.deadLetter).toHaveLength(0)
  })

  it('processes multiple items', async () => {
    const queue = new RetryQueue<number>()
    const results: number[] = []
    const handler = vi.fn().mockImplementation(async (n: number) => {
      results.push(n)
    })

    queue.enqueue(1, handler)
    queue.enqueue(2, handler)
    queue.enqueue(3, handler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await processPromise

    expect(results).toEqual([1, 2, 3])
    expect(queue.deadLetter).toHaveLength(0)
  })

  it('retries a failing item and succeeds on retry', async () => {
    const queue = new RetryQueue<string>({ initialDelay: 1000, maxRetries: 3 })
    const handler = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined)

    queue.enqueue('item', handler)
    const processPromise = queue.process()

    await vi.advanceTimersByTimeAsync(0) // let first attempt fail
    await vi.advanceTimersByTimeAsync(1000) // advance past delay
    await processPromise

    expect(handler).toHaveBeenCalledTimes(2)
    expect(queue.deadLetter).toHaveLength(0)
  })

  it('moves item to dead letter after exceeding maxRetries', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 2, initialDelay: 100 })
    const handler = vi.fn().mockRejectedValue(new Error('always fails'))

    queue.enqueue('item', handler)
    const processPromise = queue.process()

    await vi.advanceTimersByTimeAsync(0) // attempt 1 fails
    await vi.advanceTimersByTimeAsync(100) // delay before attempt 2
    await vi.advanceTimersByTimeAsync(200) // delay before attempt 3
    await processPromise

    expect(handler).toHaveBeenCalledTimes(3) // maxRetries=2 means 3 attempts total
    expect(queue.deadLetter).toHaveLength(1)
    expect(queue.deadLetter[0].item).toBe('item')
    expect(queue.deadLetter[0].attempts).toBe(3)
    expect(queue.deadLetter[0].lastError.message).toBe('always fails')
  })

  it('uses exponential backoff between retries', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 3, initialDelay: 1000, backoffFactor: 2 })
    const delays: number[] = []
    const handler = vi.fn().mockRejectedValue(new Error('fail'))

    queue.onRetry((event) => {
      delays.push(event.nextDelay)
    })

    queue.enqueue('item', handler)
    const processPromise = queue.process()
    processPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0) // attempt 1
    await vi.advanceTimersByTimeAsync(1000) // delay: 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(2000) // delay: 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(4000) // delay: 1000 * 2^2 = 4000
    await processPromise

    expect(delays).toEqual([1000, 2000, 4000])
  })

  it('caps backoff delay at maxDelay', async () => {
    const queue = new RetryQueue<string>({
      maxRetries: 3,
      initialDelay: 10000,
      maxDelay: 15000,
      backoffFactor: 2,
    })
    const delays: number[] = []

    queue.onRetry((event) => {
      delays.push(event.nextDelay)
    })

    const handler = vi.fn().mockRejectedValue(new Error('fail'))
    queue.enqueue('item', handler)
    const processPromise = queue.process()
    processPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(10000) // 10000 * 2^0 = 10000, not capped
    await vi.advanceTimersByTimeAsync(15000) // 10000 * 2^1 = 20000, capped at 15000
    await vi.advanceTimersByTimeAsync(15000) // 10000 * 2^2 = 40000, capped at 15000
    await processPromise

    expect(delays).toEqual([10000, 15000, 15000])
  })

  it('fires onRetry callback with correct event data', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 2, initialDelay: 500 })
    const retryEvents: Array<{ attempt: number; item: string }> = []

    queue.onRetry((event) => {
      retryEvents.push({ attempt: event.attempt, item: event.item })
    })

    const handler = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined)
    queue.enqueue('myItem', handler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(500)
    await processPromise

    expect(retryEvents).toHaveLength(1)
    expect(retryEvents[0]).toEqual({ attempt: 1, item: 'myItem' })
  })

  it('fires onDeadLetter callback when item exceeds maxRetries', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 1, initialDelay: 100 })
    const deadEvents: Array<{ item: string; attempts: number }> = []

    queue.onDeadLetter((dead) => {
      deadEvents.push({ item: dead.item, attempts: dead.attempts })
    })

    const handler = vi.fn().mockRejectedValue(new Error('fail'))
    queue.enqueue('failItem', handler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await processPromise

    expect(deadEvents).toHaveLength(1)
    expect(deadEvents[0]).toEqual({ item: 'failItem', attempts: 2 })
  })

  it('handles mixed items where some succeed and some fail', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 1, initialDelay: 100 })

    const successHandler = vi.fn().mockResolvedValue(undefined)
    const failHandler = vi.fn().mockRejectedValue(new Error('fail'))

    queue.enqueue('good', successHandler)
    queue.enqueue('bad', failHandler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await processPromise

    expect(queue.deadLetter).toHaveLength(1)
    expect(queue.deadLetter[0].item).toBe('bad')
  })

  it('reports stats correctly after processing', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 1, initialDelay: 100 })

    const goodHandler = vi.fn().mockResolvedValue(undefined)
    const badHandler = vi.fn().mockRejectedValue(new Error('fail'))

    queue.enqueue('success', goodHandler)
    queue.enqueue('dead', badHandler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await processPromise

    const s = queue.stats()
    expect(s.processed).toBe(1)
    expect(s.dead).toBe(1)
    expect(s.failed).toBe(2) // 2 failed attempts total (retry 1 + retry 2 for 'dead')
    expect(s.retrying).toBe(0)
  })

  it('tracks retrying count during processing', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 3, initialDelay: 1000 })

    let statsWhileRetrying: ReturnType<typeof queue.stats> | null = null

    const handler = vi.fn().mockImplementation(async () => {
      if (handler.mock.calls.length === 1) {
        throw new Error('fail once')
      }
      // capture stats on second call (during retry processing)
      statsWhileRetrying = queue.stats()
    })

    queue.enqueue('item', handler)
    const processPromise = queue.process()

    await vi.advanceTimersByTimeAsync(0) // first attempt fails
    await vi.advanceTimersByTimeAsync(1000) // delay resolves, retry begins
    await processPromise

    // After process() completes, retrying should be 0
    expect(queue.stats().retrying).toBe(0)
    expect(queue.stats().processed).toBe(1)
  })

  it('maxRetries=0 sends item to dead letter on first failure', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 0 })
    const handler = vi.fn().mockRejectedValue(new Error('fail'))

    queue.enqueue('item', handler)
    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await processPromise

    expect(handler).toHaveBeenCalledOnce()
    expect(queue.deadLetter).toHaveLength(1)
    expect(queue.deadLetter[0].attempts).toBe(1)
  })

  it('supports async handlers that take time', async () => {
    const queue = new RetryQueue<string>({ initialDelay: 0 })
    const results: string[] = []

    const asyncHandler = vi.fn().mockImplementation(async (item: string) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 50))
      results.push(item)
    })

    queue.enqueue('a', asyncHandler)
    queue.enqueue('b', asyncHandler)

    const processPromise = queue.process()
    await vi.advanceTimersByTimeAsync(100)
    await processPromise

    expect(results).toEqual(['a', 'b'])
  })

  it('skips an item whose branch is already merged and does not call its handler', async () => {
    const queue = new RetryQueue<string>()
    const handler = vi.fn().mockResolvedValue(undefined)

    queue.enqueue('feature/abc', handler)
    queue.skipMerged('feature/abc')
    await queue.process()

    expect(handler).not.toHaveBeenCalled()
    expect(queue.stats().processed).toBe(0)
  })

  it('isMerged returns true after skipMerged is called for a branch', async () => {
    const queue = new RetryQueue<string>()

    expect(queue.isMerged('feature/xyz')).toBe(false)
    queue.skipMerged('feature/xyz')
    expect(queue.isMerged('feature/xyz')).toBe(true)
  })

  it('skipMerged is idempotent — calling twice does not double-add', async () => {
    const queue = new RetryQueue<string>()

    queue.skipMerged('branch-a')
    queue.skipMerged('branch-a')
    expect(queue.isMerged('branch-a')).toBe(true)
  })

  it('unskipMerged removes a branch from the merged set', async () => {
    const queue = new RetryQueue<string>()

    queue.skipMerged('branch-b')
    expect(queue.isMerged('branch-b')).toBe(true)
    queue.unskipMerged('branch-b')
    expect(queue.isMerged('branch-b')).toBe(false)
  })

  it('unskipMerged is idempotent — calling on a non-merged branch does not throw', async () => {
    const queue = new RetryQueue<string>()

    expect(() => queue.unskipMerged('never-merged')).not.toThrow()
  })

  it('unskipMerged on a re-skipped branch restores merged state', async () => {
    const queue = new RetryQueue<string>()

    queue.skipMerged('branch-c')
    queue.unskipMerged('branch-c')
    queue.skipMerged('branch-c')
    expect(queue.isMerged('branch-c')).toBe(true)
  })

  it('processed count is unchanged for skipped items', async () => {
    const queue = new RetryQueue<string>()
    const handler = vi.fn().mockResolvedValue(undefined)

    queue.enqueue('branch-d', handler)
    queue.skipMerged('branch-d')
    await queue.process()

    expect(queue.stats().processed).toBe(0)
    expect(queue.stats().dead).toBe(0)
  })

  it('accumulates dead letter items across multiple process() calls', async () => {
    const queue = new RetryQueue<string>({ maxRetries: 0 })
    const handler = vi.fn().mockRejectedValue(new Error('fail'))

    queue.enqueue('item1', handler)
    let p = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await p

    queue.enqueue('item2', handler)
    p = queue.process()
    await vi.advanceTimersByTimeAsync(0)
    await p

    expect(queue.deadLetter).toHaveLength(2)
    expect(queue.deadLetter[0].item).toBe('item1')
    expect(queue.deadLetter[1].item).toBe('item2')
  })
})
