/**
 * Returns the number of whitespace-separated words in a string.
 * Empty or whitespace-only strings return 0.
 */
export function wordCount(text: string): number {
  if (!text) return 0
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}
