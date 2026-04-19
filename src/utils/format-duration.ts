/**
 * Formats a duration in milliseconds as a human-readable string.
 *
 * @example
 * formatDuration(500)        // "500ms"
 * formatDuration(1500)      // "1.5s"
 * formatDuration(65000)     // "1m 5s"
 * formatDuration(3661000)   // "1h 1m"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}
