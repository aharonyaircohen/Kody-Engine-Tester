export interface Change {
  path: string[]
  type: 'added' | 'removed' | 'changed'
  oldValue?: unknown
  newValue?: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function diffRecursive(a: unknown, b: unknown, path: string[], changes: Change[]): void {
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length)
    for (let i = 0; i < maxLen; i++) {
      const itemPath = [...path, String(i)]
      if (i >= a.length) {
        changes.push({ path: itemPath, type: 'added', newValue: b[i] })
      } else if (i >= b.length) {
        changes.push({ path: itemPath, type: 'removed', oldValue: a[i] })
      } else {
        diffRecursive(a[i], b[i], itemPath, changes)
      }
    }
    return
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of allKeys) {
      const keyPath = [...path, key]
      const hasA = Object.prototype.hasOwnProperty.call(a, key)
      const hasB = Object.prototype.hasOwnProperty.call(b, key)
      if (!hasA) {
        changes.push({ path: keyPath, type: 'added', newValue: b[key] })
      } else if (!hasB) {
        changes.push({ path: keyPath, type: 'removed', oldValue: a[key] })
      } else {
        diffRecursive(a[key], b[key], keyPath, changes)
      }
    }
    return
  }

  if (a !== b) {
    changes.push({ path, type: 'changed', oldValue: a, newValue: b })
  }
}

/**
 * Compares two values and returns an array of changes.
 * Each change includes the path, type ('added' | 'removed' | 'changed'),
 * and optionally oldValue and newValue.
 * Handles nested objects, arrays, and primitive values.
 * @param a - The original value
 * @param b - The new value
 * @returns An array of Change objects describing differences
 */
export function diff(a: unknown, b: unknown): Change[] {
  const changes: Change[] = []
  diffRecursive(a, b, [], changes)
  return changes
}
