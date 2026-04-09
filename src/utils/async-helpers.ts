export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delayMs: number,
  backoffFactor: number = 2
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

      const delay = delayMs * Math.pow(backoffFactor, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
