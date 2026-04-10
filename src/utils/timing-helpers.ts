export interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const leading = options.leading
  const trailing = options.trailing

  // Leading executes if explicitly set to true, or if trailing is explicitly false (immediate mode)
  const shouldLeading = leading === true || (trailing === false)
  // Trailing executes by default (standard debounce), unless leading is true (leading-only mode)
  const shouldTrailing = leading === true ? trailing === true : trailing !== false

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let inDebounceWindow = false

  return function (this: unknown, ...args: Parameters<T>): void {
    lastArgs = args

    // Clear any pending execution
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Execute leading edge if enabled and we're not already in a debounce window
    if (shouldLeading && !inDebounceWindow) {
      fn.apply(this, args)
    }

    // Track debounce window and set up trailing execution
    if (shouldTrailing || shouldLeading) {
      inDebounceWindow = true
      timeoutId = setTimeout(() => {
        if (shouldTrailing && lastArgs !== undefined) {
          fn.apply(this, lastArgs)
        }
        timeoutId = undefined
        inDebounceWindow = false
      }, delay)
    }
  }
}
