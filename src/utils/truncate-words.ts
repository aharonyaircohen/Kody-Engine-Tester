/**
 * Truncates a string to a maximum number of words and appends a suffix if truncated.
 * If the word count is less than or equal to maxWords, the string is returned with normalized whitespace.
 */
export function truncateWords(str: string, maxWords: number, suffix: string = '...'): string {
  if (!str) return ''
  if (maxWords < 0) return str

  const trimmed = str.trim()
  if (!trimmed) return ''

  const words = trimmed.split(/\s+/)
  if (words.length <= maxWords) return words.join(' ')

  return words.slice(0, maxWords).join(' ') + suffix
}
