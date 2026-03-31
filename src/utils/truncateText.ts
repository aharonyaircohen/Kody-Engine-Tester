/**
 * Truncates text to a maximum length and appends "..." if truncated.
 * Returns the original text unchanged if it is within the maxLength.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || maxLength <= 0) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
