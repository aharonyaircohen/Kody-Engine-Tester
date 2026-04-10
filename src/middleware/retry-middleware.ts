import { NextRequest, NextResponse } from 'next/server'

export interface RetryMiddlewareConfig {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  shouldRetry?: (error: Error) => boolean
  fetchFn?: typeof globalThis.fetch
}

export interface RetryError extends Error {
  response?: Response
}

/**
 * Creates a retry middleware that wraps HTTP requests with exponential backoff.
 *
 * @example
 * ```typescript
 * const mw = createRetryMiddleware({
 *   maxRetries: 3,
 *   baseDelay: 1000,
 *   maxDelay: 30000,
 *   backoffFactor: 2,
 * })
 *
 * export default mw.middleware
 * ```
 */
export function createRetryMiddleware(config: RetryMiddlewareConfig = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry,
    fetchFn,
  } = config

  const fetch = fetchFn ?? globalThis.fetch

  /**
   * Determines if an error or response status should trigger a retry.
   */
  function defaultShouldRetry(error: Error): boolean {
    const retryErr = error as RetryError
    if (retryErr.response) {
      // Retry on 5xx server errors
      return retryErr.response.status >= 500
    }
    // Retry on network errors (no response)
    return true
  }

  const retryPredicate = shouldRetry ?? defaultShouldRetry

  /**
   * Converts a Response to NextResponse.
   */
  function toNextResponse(response: Response): NextResponse {
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    })
  }

  async function executeWithRetry(request: NextRequest): Promise<NextResponse> {
    let lastError: RetryError | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(request)

        // Wrap response in error-like object for retry check
        const retryError = new Error('retry-check') as RetryError
        retryError.response = response

        // Check if we should retry based on response status
        if (!retryPredicate(retryError)) {
          // Not retryable - return immediately
          return toNextResponse(response)
        }

        // For 5xx errors, throw to trigger retry
        if (response.status >= 500) {
          lastError = retryError
          if (attempt === maxRetries) {
            return new NextResponse(await response.text(), {
              status: response.status,
              headers: response.headers,
            })
          }
          const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        // For 2xx-4xx, return normally
        return toNextResponse(response)
      } catch (error) {
        lastError = error instanceof Error ? (error as RetryError) : new Error(String(error)) as RetryError

        // Check if we should retry this error
        if (!retryPredicate(lastError)) {
          // Not retryable - return error response
          if (lastError.response) {
            return new NextResponse(await lastError.response.text(), {
              status: lastError.response.status,
              headers: lastError.response.headers,
            })
          }
          return new NextResponse(JSON.stringify({ error: 'Request failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (attempt === maxRetries) {
          break
        }

        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    // All retries exhausted
    if (lastError?.response) {
      return new NextResponse(await lastError.response.text(), {
        status: lastError.response.status,
        headers: lastError.response.headers,
      })
    }

    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  function middleware(request: NextRequest): NextResponse {
    return executeWithRetry(request) as unknown as NextResponse
  }

  return middleware
}