/**
 * Formats a duration in milliseconds into a human-readable string.
 *
 * @example
 * formatDuration(1500)    // "1.5s"
 * formatDuration(60000)  // "1m 0s"
 * formatDuration(125500) // "2m 5.5s"
 * formatDuration(500)    // "500ms"
 */
function stripTrailingZero(s: string): string {
  return s.replace(/\.0+$/, '')
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error('ms must be a finite, non-negative number')
  }

  // Under 1 second → Nms
  if (ms < 1000) {
    return `${ms}ms`
  }

  // 1 second or more → compute total seconds
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds - minutes * 60

  const rawSeconds = stripTrailingZero(remainingSeconds.toFixed(1))
  const secondsAsNum = Number(rawSeconds)

  // Handle rollover when rounding pushes seconds to 60 or more
  if (secondsAsNum >= 60) {
    const extraMinutes = Math.floor(secondsAsNum / 60)
    const rolledSeconds = secondsAsNum - extraMinutes * 60
    const rolledRaw = stripTrailingZero(rolledSeconds.toFixed(1))
    return `${minutes + extraMinutes}m ${rolledRaw}s`
  }

  if (minutes === 0) {
    return `${rawSeconds}s`
  }
  return `${minutes}m ${rawSeconds}s`
}

