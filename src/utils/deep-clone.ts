/**
 * Creates a deep clone of any JavaScript value.
 * Uses structuredClone with a fallback to JSON parse/stringify for environments
 * where structuredClone is not available.
 * @param value - The value to deep clone
 * @returns A deep copy of the value
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Use structuredClone if available (modern environments)
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  // Fallback for environments without structuredClone
  return JSON.parse(JSON.stringify(value))
}