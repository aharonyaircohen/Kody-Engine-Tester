/**
 * Deeply merges source into target without mutating either.
 * Handles: plain objects, arrays, Date, RegExp, Map, Set, and nested combinations.
 * For arrays, source replaces target (no index-by-index merge).
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object representing the merged result
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result: Record<string, unknown> = {}

  // Clone target properties
  for (const key of Object.keys(target as object)) {
    const targetValue = (target as Record<string, unknown>)[key]
    result[key] = deepCloneValue(targetValue)
  }

  // Merge source properties (override)
  for (const key of Object.keys(source as object)) {
    const sourceValue = (source as Record<string, unknown>)[key]
    const targetValue = (target as Record<string, unknown>)[key]
    result[key] = deepMergeValue(targetValue, sourceValue)
  }

  return result as T
}

function deepCloneValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags)
  }

  if (value instanceof Map) {
    const cloned = new Map()
    for (const [k, v] of value) {
      cloned.set(deepCloneValue(k), deepCloneValue(v))
    }
    return cloned
  }

  if (value instanceof Set) {
    const cloned = new Set()
    for (const item of value) {
      cloned.add(deepCloneValue(item))
    }
    return cloned
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepCloneValue(item))
  }

  const cloned: Record<string, unknown> = {}
  for (const k of Object.keys(value as object)) {
    cloned[k] = deepCloneValue((value as Record<string, unknown>)[k])
  }
  return cloned
}

function deepMergeValue(target: unknown, source: unknown): unknown {
  // If source is null/undefined or primitive, return source (cloned)
  if (source === null || typeof source !== 'object') {
    return deepCloneValue(source)
  }

  // If target is null/undefined or primitive, clone source
  if (target === null || typeof target !== 'object') {
    return deepCloneValue(source)
  }

  // Both are objects - recurse
  if (Array.isArray(target) || Array.isArray(source)) {
    // Arrays: replace target with source (cloned)
    return deepCloneValue(source)
  }

  if (target instanceof Date || source instanceof Date) {
    return deepCloneValue(source)
  }

  if (target instanceof RegExp || source instanceof RegExp) {
    return deepCloneValue(source)
  }

  if (target instanceof Map || source instanceof Map) {
    return deepCloneValue(source)
  }

  if (target instanceof Set || source instanceof Set) {
    return deepCloneValue(source)
  }

  // Both are plain objects - recursive merge
  const merged: Record<string, unknown> = {}
  for (const key of Object.keys(target as object)) {
    merged[key] = deepCloneValue((target as Record<string, unknown>)[key])
  }
  for (const key of Object.keys(source as object)) {
    const sourceValue = (source as Record<string, unknown>)[key]
    const targetValue = (target as Record<string, unknown>)[key]
    merged[key] = deepMergeValue(targetValue, sourceValue)
  }
  return merged
}