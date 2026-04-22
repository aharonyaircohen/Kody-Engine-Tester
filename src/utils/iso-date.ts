/**
 * Validates that a string is a valid ISO 8601 date-time that round-trips
 * through JavaScript's Date API. Rejects date-only strings, local-time
 * strings, and overflow inputs like "2025-13-45".
 *
 * Accepts strings with or without fractional seconds (e.g. both
 * "2025-04-22T10:15:30Z" and "2025-04-22T10:15:30.000Z" are valid).
 */
export function isValidIsoDate(s: string): boolean {
  if (typeof s !== 'string' || s === '') return false

  const date = new Date(s)
  if (Number.isNaN(date.getTime())) return false

  // Normalize the parsed date back to ISO string for comparison.
  // This handles inputs with or without fractional seconds gracefully
  // (e.g. "2025-04-22T10:15:30Z" normalizes to "2025-04-22T10:15:30.000Z").
  const iso = date.toISOString()

  // Reject strings where the fractional-second precision doesn't match.
  // Accept: exact match (with .000Z) OR bare Z suffix (no ms).
  return iso === s || iso.replace('.000Z', 'Z') === s
}
