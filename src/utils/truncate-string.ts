/**
 * Truncates a string to a maximum length and appends an ellipsis if truncated.
 * The total output length (string content + ellipsis) equals maxLength.
 * If the string length is less than or equal to maxLength, it is returned unchanged.
 */
export function truncateString(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (!str) return ''
  if (maxLength < 0) return str
  if (str.length <= maxLength) return str
  const contentLen = Math.max(0, maxLength - ellipsis.length)
  return str.slice(0, contentLen) + ellipsis
}
