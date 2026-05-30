export function throttle<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let last = 0
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      return fn(...args)
    }
    return undefined
  }
}
