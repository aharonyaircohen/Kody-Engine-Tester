/**
 * Converts a string to uppercase.
 * Returns empty string for null or undefined inputs.
 */
export function toUpper(s: string | null | undefined): string {
  if (!s) return ''
  return s.toUpperCase()
}
