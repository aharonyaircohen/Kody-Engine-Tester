export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  let lastCall = 0

  return function (this: unknown, ...args: unknown[]) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, args)
    }
  } as T
}
