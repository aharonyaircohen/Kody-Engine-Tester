/**
 * Converts bytes to a human-readable string (KB, MB, GB, etc.).
 * - Uses binary units (1024) by default; decimal units (1000) available via decimal option.
 * - Returns "0 B" for negative or NaN values.
 */
export function formatBytes(bytes: number, options: { decimal?: boolean } = {}): string {
  const { decimal = false } = options
  const base = decimal ? 1000 : 1024
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  if (bytes < 0 || Number.isNaN(bytes)) return '0 B'
  if (bytes === 0) return '0 B'
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1)
  const value = bytes / Math.pow(base, exponent)
  // Only use 0 decimals for large units (MB+) where precision loss is acceptable
  const decimals = exponent >= 2 ? 0 : 2
  const formatted = value.toFixed(decimals).replace(/\.?0+$/, '')
  return `${formatted} ${units[exponent]}`
}

/**
 * Truncates a string to a maximum length and inserts an ellipsis in the middle.
 * - If the string length is less than or equal to maxLen, it is returned unchanged.
 * - The ellipsis counts toward the maxLen limit.
 * - For odd-length splits, the right side gets one more character than the left.
 */
export function truncateMiddle(str: string, maxLen: number, ellipsis: string = '...'): string {
  if (!str) return ''
  if (maxLen < 0) return str
  const ellipsisLen = ellipsis.length
  if (str.length <= maxLen) return str
  if (maxLen <= ellipsisLen) return ellipsis.slice(0, maxLen)
  const contentLen = maxLen - ellipsisLen
  if (contentLen <= 0) return ellipsis.slice(0, maxLen)
  // Extra character goes to the right side when contentLen is odd
  const leftLen = Math.floor(contentLen / 2)
  const rightLen = contentLen - leftLen
  return str.slice(0, leftLen) + ellipsis + str.slice(-rightLen)
}

// Re-export slugify for convenience
export { slugify } from './slugify'
