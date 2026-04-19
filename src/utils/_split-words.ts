/**
 * Splits a string into an array of whitespace-separated words.
 * Empty or whitespace-only strings return an empty array.
 */
export function _splitWords(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  return trimmed.split(/\s+/)
}
