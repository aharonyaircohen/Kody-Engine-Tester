/**
 * Truncates a string to a maximum length and appends a suffix if truncated.
 * The total output length (string content + suffix) equals maxLen.
 * If the string length is less than or equal to maxLen, it is returned unchanged.
 */
export function truncate(str: string, maxLen: number, suffix: string = '...'): string {
  if (!str) return ''
  if (maxLen < 0) return str
  if (str.length <= maxLen) return str
  const contentLen = Math.max(0, maxLen - suffix.length)
  return str.slice(0, contentLen) + suffix
}

