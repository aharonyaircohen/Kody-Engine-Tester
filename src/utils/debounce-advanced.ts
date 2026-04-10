export interface DebounceAdvancedOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceAdvanced<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: DebounceAdvancedOptions = {}
): DebouncedFunction<T> {
  const leading = options.leading
  const trailing = options.trailing
  const maxWait = options.maxWait

  const shouldLeading = leading === true || (trailing === false)
  const shouldTrailing = leading === true ? trailing === true : trailing !== false

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let maxWaitTimeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let inDebounceWindow = false
  let lastCallTime: number | undefined

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (maxWaitTimeoutId) {
      clearTimeout(maxWaitTimeoutId)
      maxWaitTimeoutId = undefined
    }
    if (lastArgs !== undefined && shouldTrailing) {
      fn.apply(undefined, lastArgs)
    }
    lastArgs = undefined
    inDebounceWindow = false
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (maxWaitTimeoutId) {
      clearTimeout(maxWaitTimeoutId)
      maxWaitTimeoutId = undefined
    }
    lastArgs = undefined
    inDebounceWindow = false
  }

  const debouncedFn = function (this: unknown, ...args: Parameters<T>): void {
    lastArgs = args

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (shouldLeading && !inDebounceWindow) {
      fn.apply(this, args)
    }

    if (shouldTrailing || shouldLeading) {
      inDebounceWindow = true
      lastCallTime = Date.now()

      if (maxWait && !maxWaitTimeoutId) {
        maxWaitTimeoutId = setTimeout(() => {
          if (lastArgs !== undefined) {
            fn.apply(this, lastArgs)
          }
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = undefined
          }
          maxWaitTimeoutId = undefined
          inDebounceWindow = false
          lastArgs = undefined
        }, maxWait)
      }

      timeoutId = setTimeout(() => {
        if (shouldTrailing && lastArgs !== undefined) {
          fn.apply(this, lastArgs)
        }
        timeoutId = undefined
        inDebounceWindow = false
        lastCallTime = undefined
      }, delay)
    }
  }

  debouncedFn.cancel = cancel
  debouncedFn.flush = flush

  return debouncedFn as DebouncedFunction<T>
}