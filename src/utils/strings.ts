/**
 * Capitalizes the first character of a string (sentence case) and lowercases the remainder.
 * - If the string is empty, returns an empty string.
 * - If the string has only one character, returns it uppercased.
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
