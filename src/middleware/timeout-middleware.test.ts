import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createTimeoutMiddleware, addTimeoutListener } from './timeout-middleware'

describe('createTimeoutMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(timeoutMs?: number): NextRequest {
    const url = new URL('http://localhost/api/test')
    const request = new NextRequest(url)
    if (timeoutMs !== undefined) {
      // @ts-expect-error - timeout is a custom property
      request.timeout = timeoutMs
    }
    return request
  }

  describe('timeout enforcement', () => {
    it('returns 504 when handler exceeds timeout', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const handlerPromise = mw(makeRequest(), async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(150)
      const response = await handlerPromise

      expect(response.status).toBe(504)
      expect(await response.json()).toEqual({ error: 'Gateway Timeout' })
    })

    it('does not timeout when handler completes within timeout', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const handlerPromise = mw(makeRequest(), async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(60)
      const response = await handlerPromise

      expect(response.status).toBe(200)
    })

    it('uses req.timeout when set on request', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      // Request has its own timeout of 200ms, should not timeout with 100ms default
      const handlerPromise = mw(makeRequest(200), async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(160)
      const response = await handlerPromise

      expect(response.status).toBe(200)
    })

    it('uses default timeout when req.timeout is not set', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 50 })

      const handlerPromise = mw(makeRequest(), async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(60)
      const response = await handlerPromise

      expect(response.status).toBe(504)
    })
  })

  describe('cleanup', () => {
    it('cleans up timer on normal completion', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const handlerPromise = mw(makeRequest(), async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(60)
      const response = await handlerPromise

      expect(response.status).toBe(200)
      // If we get here without hanging, cleanup worked
    })
  })

  describe('timeout event emission', () => {
    it('emits timeout event when timeout occurs', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const request = makeRequest()
      const timeoutHandler = vi.fn()

      // Register the timeout listener
      addTimeoutListener(request, timeoutHandler)

      const handlerPromise = mw(request, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(150)
      await handlerPromise

      expect(timeoutHandler).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles immediate response without timeout', async () => {
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const response = await mw(makeRequest(), async () => {
        return new Response('immediate')
      })

      expect(response.status).toBe(200)
      expect(await response.text()).toBe('immediate')
    })

    it('handles handler that rejects with 500 response', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const handlerPromise = mw(makeRequest(), async () => {
        await new Promise((_, reject) => setTimeout(() => reject(new Error('handler error')), 50))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(60)
      const response = await handlerPromise

      // Middleware catches handler errors and returns 500
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal Server Error' })
    })

    it('does not double-timeout after first timeout', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware({ defaultTimeoutMs: 100 })

      const request = makeRequest()
      const timeoutHandler = vi.fn()
      addTimeoutListener(request, timeoutHandler)

      const handlerPromise = mw(request, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(150)
      const response = await handlerPromise

      expect(response.status).toBe(504)
      expect(timeoutHandler).toHaveBeenCalledTimes(1)

      // Advance more time, handler should not fire again
      await vi.advanceTimersByTimeAsync(100)
      expect(timeoutHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('default configuration', () => {
    it('uses 30 second default when no config provided', async () => {
      vi.useFakeTimers()
      const mw = createTimeoutMiddleware()

      const request = makeRequest()
      const timeoutHandler = vi.fn()
      addTimeoutListener(request, timeoutHandler)

      // Handler takes longer than 30s default
      const handlerPromise = mw(request, async () => {
        await new Promise((resolve) => setTimeout(resolve, 31_000))
        return new Response('ok')
      })

      await vi.advanceTimersByTimeAsync(30_500)
      const response = await handlerPromise

      expect(response.status).toBe(504)
      expect(timeoutHandler).toHaveBeenCalled()
    })
  })
})