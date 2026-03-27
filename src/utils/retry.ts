export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  shouldRetry?: (error: Error) => boolean
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        throw lastError
      }

      if (shouldRetry && !shouldRetry(lastError)) {
        throw lastError
      }

      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
