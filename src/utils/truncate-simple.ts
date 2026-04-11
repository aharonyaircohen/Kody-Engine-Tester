export function truncateSimple(str: string, maxLen: number): string {
  if (!str) return ''
  if (maxLen < 0) return str
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}