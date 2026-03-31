/**
 * Formats a date as YYYY-MM-DD using template literals.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
  options: DebounceOptions = {}
): T {
  const leading = options.leading
  const trailing = options.trailing

  const shouldLeading = leading === true || (trailing === false)
  const shouldTrailing = leading === true ? trailing === true : trailing !== false

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: unknown[] | undefined
  let inDebounceWindow = false

  return function (this: unknown, ...args: unknown[]): void {
    lastArgs = args

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (shouldLeading && !inDebounceWindow) {
      fn.apply(this, args)
    }

    if (shouldTrailing || shouldLeading) {
      inDebounceWindow = true
      timeoutId = setTimeout(() => {
        if (shouldTrailing && lastArgs !== undefined) {
          fn.apply(this, lastArgs)
        }
        timeoutId = undefined
        inDebounceWindow = false
      }, ms)
    }
  } as T
}
