/**
 * Checks if a string is a palindrome, ignoring case, spaces, and punctuation.
 * A palindrome reads the same forwards and backwards.
 */
export function palindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '')
  return cleaned === cleaned.split('').reverse().join('')
}
