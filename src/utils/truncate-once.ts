/**
 * Truncates a string to a maximum length, appending '...' if truncated.
 * Unlike a normal truncate, it only truncates once — it will not shorten
 * a string that has already been truncated (detected by trailing '...').
 */
export function truncateOnce(str: string, maxLength: number): string {
  if (str.endsWith('...')) return str

  if (maxLength < 3) return '...'
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}