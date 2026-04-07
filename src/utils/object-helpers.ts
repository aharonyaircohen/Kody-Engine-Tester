/**
 * Recursively merges source into target without mutating either.
 * Handles: plain objects, arrays, Date, RegExp, Map, Set, and nested combinations.
 * Arrays are replaced rather than merged (source array replaces target array).
 * Throws an error if a circular reference is detected.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @param seen - Internal set for circular reference detection
 * @returns A new object with source merged into target
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>, seen?: WeakSet<object>): T {
  // Handle null/undefined source
  if (source === null || source === undefined) {
    return deepClone(target, new WeakSet())
  }

  // Handle primitives (non-object source values)
  if (typeof source !== 'object') {
    return source as T
  }

  // Handle case where target is primitive-like
  if (typeof target !== 'object' || target === null) {
    return deepClone(source, new WeakSet()) as T
  }

  // Initialize seen set (create new for each top-level call)
  if (seen === undefined) {
    seen = new WeakSet()
    // Pre-scan target for circular references before starting
    if (containsCircular(target)) {
      throw new Error('Circular reference detected in target')
    }
  }

  // Check for circular references in target (for recursive calls, checked before recursing)
  if (seen.has(target)) {
    throw new Error('Circular reference detected in target')
  }

  seen.add(target)

  // Handle Date
  if (target instanceof Date) {
    if (source instanceof Date) {
      return new Date(source.getTime()) as T
    }
    return deepClone(target, seen) as T
  }

  // Handle RegExp
  if (target instanceof RegExp) {
    if (source instanceof RegExp) {
      return new RegExp(source.source, source.flags) as T
    }
    return deepClone(target, seen) as T
  }

  // Handle Map
  if (target instanceof Map) {
    const cloned = new Map()
    if (source instanceof Map) {
      for (const [k, v] of source) {
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      }
    } else {
      // If source is not a Map, clone target's entries
      for (const [k, v] of target) {
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      }
    }
    return cloned as T
  }

  // Handle Set
  if (target instanceof Set) {
    const cloned = new Set()
    if (source instanceof Set) {
      for (const item of source) {
        cloned.add(deepClone(item, seen))
      }
    } else {
      // If source is not a Set, clone target's entries
      for (const item of target) {
        cloned.add(deepClone(item, seen))
      }
    }
    return cloned as T
  }

  // Handle Array - replace entirely rather than merge
  if (Array.isArray(target)) {
    if (Array.isArray(source)) {
      return source.map((item) => deepClone(item, seen)) as unknown as T
    }
    return deepClone(target, seen) as T
  }

  // Handle plain objects - recursive merge
  const merged: Record<string, unknown> = { ...(target as Record<string, unknown>) }

  for (const key of Object.keys(source as Record<string, unknown>)) {
    const sourceValue = (source as Record<string, unknown>)[key]
    const targetValue = (target as Record<string, unknown>)[key]

    // If source value is undefined, preserve target value
    if (sourceValue === undefined) {
      continue
    }

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue) &&
      !(sourceValue instanceof Date) &&
      !(targetValue instanceof Date) &&
      !(sourceValue instanceof RegExp) &&
      !(targetValue instanceof RegExp) &&
      !(sourceValue instanceof Map) &&
      !(targetValue instanceof Map) &&
      !(sourceValue instanceof Set) &&
      !(targetValue instanceof Set)
    ) {
      // Both are plain objects - recursively merge
      merged[key] = deepMerge(
        targetValue as object,
        sourceValue as Partial<typeof targetValue>,
        seen,
      )
    } else {
      // For all other cases (primitives, arrays, special types), use source value
      merged[key] = deepClone(sourceValue, seen)
    }
  }

  return merged as T
}

/**
 * Checks if an object contains circular references by traversing all its properties.
 * Uses a local seen set to track visited objects within this traversal only.
 * @param value - The value to check
 * @returns true if circular reference is found
 */
function containsCircular(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const seen = new WeakSet<object>()

  function check(v: unknown): boolean {
    if (v === null || typeof v !== 'object') {
      return false
    }

    if (seen.has(v as object)) {
      return true
    }

    seen.add(v as object)

    if (v instanceof Date || v instanceof RegExp) {
      return false
    }

    if (v instanceof Map) {
      for (const [k, val] of v) {
        if (check(k) || check(val)) {
          return true
        }
      }
      return false
    }

    if (v instanceof Set) {
      for (const item of v) {
        if (check(item)) {
          return true
        }
      }
      return false
    }

    if (Array.isArray(v)) {
      for (const item of v) {
        if (check(item)) {
          return true
        }
      }
      return false
    }

    // Plain objects
    for (const key of Object.keys(v as object)) {
      if (check((v as Record<string, unknown>)[key])) {
        return true
      }
    }

    return false
  }

  return check(value)
}

/**
 * Internal helper - creates a deep clone of a value (copied from deepClone logic).
 * Handles: plain objects, arrays, Date, RegExp, Map, Set.
 * @param value - The value to deep clone
 * @param seen - Internal set for circular reference detection
 * @returns A deep copy of the value
 */
function deepClone<T>(value: T, seen: WeakSet<object>): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value as object)) {
    throw new Error('Circular reference detected')
  }

  seen.add(value as object)

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T
  }

  if (value instanceof Map) {
    const cloned = new Map()
    for (const [k, v] of value) {
      cloned.set(deepClone(k, seen), deepClone(v, seen))
    }
    return cloned as T
  }

  if (value instanceof Set) {
    const cloned = new Set()
    for (const item of value) {
      cloned.add(deepClone(item, seen))
    }
    return cloned as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item, seen)) as T
  }

  const cloned: Record<string, unknown> = {}
  for (const key of Object.keys(value as object)) {
    cloned[key] = deepClone((value as Record<string, unknown>)[key], seen)
  }
  return cloned as T
}
