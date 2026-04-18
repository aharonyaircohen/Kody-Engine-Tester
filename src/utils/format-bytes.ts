/**
 * Formats a byte count as a human-readable string.
 *
 * @example
 * formatBytes(0)       // "0B"
 * formatBytes(512)     // "512B"
 * formatBytes(1024)    // "1.0KB"
 * formatBytes(1536)    // "1.5KB"
 * formatBytes(1048576) // "1.0MB"
 * formatBytes(1073741824) // "1.0GB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`
  }
  if (bytes < 1024 * 1024) {
    const n = bytes / 1024
    return `${n.toFixed(1)}KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    const n = bytes / (1024 * 1024)
    return `${n.toFixed(1)}MB`
  }
  const n = bytes / (1024 * 1024 * 1024)
  return `${n.toFixed(1)}GB`
}
