export interface ObjectDiffChange {
  key: string
  type: 'added' | 'removed' | 'changed'
  oldValue?: unknown
  newValue?: unknown
}

export interface ObjectDiffResult {
  added: string[]
  removed: string[]
  changed: Array<{ key: string; oldValue: unknown; newValue: unknown }>
  hasChanges: boolean
}

/**
 * Compares two objects and returns a structured diff result.
 * Only considers own enumerable properties.
 * @param a - The original object
 * @param b - The new object
 * @returns ObjectDiffResult with categorized changes
 */
export function objectDiff(a: Record<string, unknown>, b: Record<string, unknown>): ObjectDiffResult {
  const added: string[] = []
  const removed: string[] = []
  const changed: Array<{ key: string; oldValue: unknown; newValue: unknown }> = []

  const keysA = new Set(Object.keys(a))
  const keysB = new Set(Object.keys(b))

  for (const key of keysB) {
    if (!keysA.has(key)) {
      added.push(key)
    }
  }

  for (const key of keysA) {
    if (!keysB.has(key)) {
      removed.push(key)
    } else if (a[key] !== b[key]) {
      changed.push({ key, oldValue: a[key], newValue: b[key] })
    }
  }

  return {
    added,
    removed,
    changed,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  }
}