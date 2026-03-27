import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sleep, withTimeout, TimeoutError } from './sleep'

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the specified number of milliseconds', async () => {
    const promise = sleep(500)
    await vi.advanceTimersByTimeAsync(500)
    await expect(promise).resolves.toBeUndefined()
  })

  it('does not resolve before the specified time', async () => {
    const promise = sleep(1000)
    await vi.advanceTimersByTimeAsync(999)

    let resolved = false
    promise.then(() => {
      resolved = true
    })
    await vi.advanceTimersByTimeAsync(0)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await expect(promise).resolves.toBeUndefined()
  })
})

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves when the promise resolves within the timeout', async () => {
    const promise = Promise.resolve('success')
    const result = withTimeout(promise, 1000)
    await vi.advanceTimersByTimeAsync(0)
    await expect(result).resolves.toBe('success')
  })

  it('resolves when the promise resolves before the timeout', async () => {
    let resolve: (value: string) => void
    const promise = new Promise<string>((r) => {
      resolve = r
    })

    const resultPromise = withTimeout(promise, 1000)

    await vi.advanceTimersByTimeAsync(500)
    resolve!('done')

    await vi.advanceTimersByTimeAsync(0)
    await expect(resultPromise).resolves.toBe('done')
  })

  it('rejects with TimeoutError when the promise does not resolve within the timeout', async () => {
    let resolve: (value: string) => void
    const promise = new Promise<string>((r) => {
      resolve = r
    })

    const resultPromise = withTimeout(promise, 500)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(500)

    await expect(resultPromise).rejects.toThrow('Operation timed out after 500ms')
    await expect(resultPromise).rejects.toBeInstanceOf(TimeoutError)
  })

  it('clears the timeout when the promise resolves', async () => {
    let resolve: (value: string) => void
    const promise = new Promise<string>((r) => {
      resolve = r
    })

    const clearSpy = vi.spyOn(global, 'clearTimeout')

    const resultPromise = withTimeout(promise, 1000)

    await vi.advanceTimersByTimeAsync(500)
    resolve!('done')
    await vi.advanceTimersByTimeAsync(0)

    await expect(resultPromise).resolves.toBe('done')
    expect(clearSpy).toHaveBeenCalled()
  })

  it('clears the timeout when the promise rejects', async () => {
    let reject: (reason: Error) => void
    const promise = new Promise<string>((_, r) => {
      reject = r
    })

    const clearSpy = vi.spyOn(global, 'clearTimeout')

    const resultPromise = withTimeout(promise, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(500)
    reject!(new Error('failure'))
    await vi.advanceTimersByTimeAsync(0)

    await expect(resultPromise).rejects.toThrow('failure')
    expect(clearSpy).toHaveBeenCalled()
  })
})
