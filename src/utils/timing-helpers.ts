/**
 * Simplified debounce utility - delays function execution until after delayMs milliseconds
 * from the last call. Only executes with the most recent arguments.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = undefined
    }, delayMs)
  } as T
}
