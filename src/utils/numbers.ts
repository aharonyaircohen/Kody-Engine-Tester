/**
 * Returns the value(s) that appear most frequently in an array.
 * If multiple values tie for most frequent, returns all of them in ascending order.
 * @param values - The array of numbers
 * @returns An array of the most frequent value(s)
 */
export function mode(values: number[]): number[] {
  if (values.length === 0) return []

  const frequency = new Map<number, number>()
  for (const value of values) {
    frequency.set(value, (frequency.get(value) ?? 0) + 1)
  }

  let maxFreq = 0
  for (const count of frequency.values()) {
    if (count > maxFreq) maxFreq = count
  }

  const modes: number[] = []
  for (const [value, count] of frequency) {
    if (count === maxFreq) modes.push(value)
  }

  return modes.sort((a, b) => a - b)
}