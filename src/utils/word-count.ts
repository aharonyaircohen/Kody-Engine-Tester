import { _splitWords } from './_split-words'

/**
 * Returns the number of whitespace-separated words in a string.
 * Empty or whitespace-only strings return 0.
 */
export function wordCount(text: string): number {
  if (!text) return 0
  return _splitWords(text).length
}
