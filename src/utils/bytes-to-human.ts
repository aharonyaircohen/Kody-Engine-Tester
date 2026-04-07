const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

export function bytesToHuman(bytes: number): string {
  if (bytes === 0) return '0 B'

  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024
    unitIndex++
  }

  return `${value.toFixed(2)} ${UNITS[unitIndex]}`
}