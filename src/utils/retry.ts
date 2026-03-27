/**
 * Options for configuring retry behavior
 */
export interface RetryOptions {
  /**
   * Maximum number of retries (default: 3)
   * Total attempts = 1 + maxRetries
   */
  maxRetries?: number
  /**
   * Initial delay in milliseconds before first retry (default: 1000)
   */
  initialDelay?: number
  /**
   * Maximum delay in milliseconds between retries (default: 30000)
   */
  maxDelay?: number
  /**
   * Multiplier for exponential backoff (default: 2)
   */
  backoffFactor?: number
  /**
   * Optional predicate to determine if a specific error should trigger a retry
   * If returns false, the error is rethrown immediately without retrying
   */
  shouldRetry?: (error: Error) => boolean
}

/**
 * Wraps an async function with exponential backoff retry logic
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function or throws the last error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options ?? {}

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If this was the last attempt or shouldRetry returns false, rethrow
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      // Calculate delay for next retry with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  throw lastError || new Error('Retry failed without error')
}
