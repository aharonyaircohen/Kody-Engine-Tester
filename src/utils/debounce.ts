interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
  options: DebounceOptions = {},
) {
  // Semantics:
  // - No options: trailing only (count=1 after delay).
  // - {leading:true}: leading only (count=1 even if many calls in window).
  // - {trailing:false}: implies leading=true (otherwise nothing fires).
  // - {leading:true, trailing:true}: both fire when multiple calls in window.
  const explicitL = options.leading
  const explicitT = options.trailing
  let leading: boolean
  let trailing: boolean
  if (explicitL === true && explicitT === true) {
    leading = true
    trailing = true
  } else if (explicitL === true) {
    leading = true
    trailing = false
  } else if (explicitT === false) {
    leading = true
    trailing = false
  } else {
    leading = false
    trailing = true
  }

  let id: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null
  let invocations = 0

  return function (this: unknown, ...args: Parameters<T>) {
    invocations++
    pendingArgs = args
    const ctx = this

    if (leading && invocations === 1 && !id) {
      fn.apply(ctx, args)
    }

    if (id) clearTimeout(id)

    id = setTimeout(() => {
      const shouldFireTrailing = trailing && (!leading || invocations > 1)
      if (shouldFireTrailing && pendingArgs) {
        fn.apply(ctx, pendingArgs)
      }
      id = null
      pendingArgs = null
      invocations = 0
    }, ms)
  }
}
