/**
 * Deeply merges source into target without mutating target.
 * Handles: plain objects, arrays, Date, RegExp, Map, Set, and nested combinations.
 * Arrays are replaced (not concatenated) to match common deep-merge semantics.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object with source properties merged in
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  // Handle null/undefined source early
  if (source === null || source === undefined) {
    return target
  }

  // Handle primitives - return target as-is
  if (target === null || typeof target !== 'object' || typeof source !== 'object') {
    return target
  }

  // Handle Map at top level
  if (target instanceof Map && source instanceof Map) {
    const result = new Map(target)
    for (const [k, v] of source) {
      result.set(k, v)
    }
    return result as unknown as T
  }

  // Handle Set at top level
  if (target instanceof Set && source instanceof Set) {
    const result = new Set(target)
    for (const v of source) {
      result.add(v)
    }
    return result as unknown as T
  }

  // Handle Array at top level
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...source] as unknown as T
  }

  // Handle Date at top level
  if (target instanceof Date && source instanceof Date) {
    return new Date(source.getTime()) as T
  }

  // Handle RegExp at top level
  if (target instanceof RegExp && source instanceof RegExp) {
    return new RegExp(source.source, source.flags) as T
  }

  // Handle plain objects
  const result = { ...target } as Record<string, unknown>

  for (const key of Object.keys(source as object)) {
    const sourceValue = (source as Record<string, unknown>)[key]
    const targetValue = (target as Record<string, unknown>)[key]

    // Handle Date - create new instance from source
    if (targetValue instanceof Date && sourceValue instanceof Date) {
      result[key] = new Date(sourceValue.getTime())
      continue
    }

    // Handle RegExp - create new instance from source
    if (targetValue instanceof RegExp && sourceValue instanceof RegExp) {
      result[key] = new RegExp(sourceValue.source, sourceValue.flags)
      continue
    }

    // Handle Map - create new instance merging target then source
    if (targetValue instanceof Map && sourceValue instanceof Map) {
      const mergedMap = new Map(targetValue)
      for (const [k, v] of sourceValue) {
        mergedMap.set(k, v)
      }
      result[key] = mergedMap
      continue
    }

    // Handle Set - create new instance merging target then source
    if (targetValue instanceof Set && sourceValue instanceof Set) {
      const mergedSet = new Set(targetValue)
      for (const v of sourceValue) {
        mergedSet.add(v)
      }
      result[key] = mergedSet
      continue
    }

    // Handle Array - replace with a copy of source
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      result[key] = [...sourceValue]
      continue
    }

    // If both values are plain objects, recurse
    if (
      targetValue !== null &&
      typeof targetValue === 'object' &&
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(targetValue) &&
      !Array.isArray(sourceValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue as Partial<typeof targetValue>)
    } else if (sourceValue !== undefined && sourceValue !== null) {
      // Copy the source value (undefined and null values don't override)
      result[key] = sourceValue
    }
  }

  return result as T
}
