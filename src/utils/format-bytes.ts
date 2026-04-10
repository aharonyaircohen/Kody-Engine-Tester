export interface FormatBytesOptions {
  /** Number of decimal places (default: 2) */
  decimals?: number
  /** Locale for formatting (default: 'en-US') */
  locale?: string
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const

/**
 * Converts a byte count to a human-readable string.
 *
 * @example
 * formatBytes(0)               // "0 B"
 * formatBytes(1024)            // "1 KB"
 * formatBytes(1048576)         // "1 MB"
 * formatBytes(1073741824)       // "1 GB"
 * formatBytes(1048576, { decimals: 1 })  // "1.0 MB"
 */
export function formatBytes(bytes: number, options: FormatBytesOptions = {}): string {
  const { decimals = 2, locale = 'en-US' } = options

  if (bytes < 0) {
    return `-${formatBytes(-bytes, options)}`
  }

  if (bytes === 0) {
    return `0 B`
  }

  const base = 1024
  const exponent = Math.floor(Math.log(bytes) / Math.log(base))
  const value = bytes / Math.pow(base, exponent)

  const clampedExponent = Math.min(exponent, UNITS.length - 1)

  if (clampedExponent === 0) {
    return `${value} ${UNITS[0]}`
  }

  return `${value.toLocaleString(locale, { maximumFractionDigits: decimals })} ${UNITS[clampedExponent]}`
}
