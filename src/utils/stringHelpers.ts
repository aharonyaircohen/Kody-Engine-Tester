/**
 * String helper utilities for common string operations.
 */

export function trimWhitespace(str: string): string {
  if (!str) return str
  return str.trim()
}

export function removeExtraSpaces(str: string): string {
  if (!str) return str
  return str.replace(/\s+/g, ' ').trim()
}

export function truncateByWords(str: string, maxWords: number, suffix: string = '...'): string {
  if (!str) return ''
  const words = str.split(/\s+/)
  if (words.length <= maxWords) return str
  return words.slice(0, maxWords).join(' ') + suffix
}

export default function stringHelper(str: string): string {
  return removeExtraSpaces(trimWhitespace(str))
}
