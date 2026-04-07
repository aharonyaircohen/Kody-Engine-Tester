/**
 * Retry utility with exponential backoff using positional parameters.
 * For options-based retry, see retry.ts
 */

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delayMs: number,
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts - 1) {
        throw lastError
      }

      // Exponential backoff: delay * 2^(attempt)
      const delay = delayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
