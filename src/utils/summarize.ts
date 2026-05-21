export interface SummaryStats {
  mean: number | null
  median: number | null
  mode: number | null
  stdDev: number | null
  count: number
}

function _mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function _median(sorted: number[]): number | null {
  const count = sorted.length
  if (count === 0) return null
  if (count % 2 === 1) {
    return sorted[Math.floor(count / 2)]
  }
  return (sorted[count / 2 - 1] + sorted[count / 2]) / 2
}

function _mode(values: number[]): number | null {
  if (values.length === 0) return null
  const frequency = new Map<number, number>()
  for (const v of values) {
    frequency.set(v, (frequency.get(v) ?? 0) + 1)
  }
  const maxFreq = Math.max(...frequency.values())
  if (maxFreq === 1) {
    // No duplicates; for a single element treat it as the mode
    return values.length === 1 ? values[0] : null
  }
  let mode = Infinity
  for (const [v, freq] of frequency) {
    if (freq === maxFreq && v < mode) {
      mode = v
    }
  }
  return mode
}

function _stdDev(values: number[], mean: number): number | null {
  if (values.length < 2) return null
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

/**
 * Returns descriptive statistics over an array of numbers.
 * mean = sum / count
 * median = middle value after sorting (avg of 2 middle when count is even)
 * mode  = most frequent value (null when empty; single value on tie, preferring smallest)
 * stdDev = population standard deviation (null when count < 2)
 * count  = values.length
 */
export default function summarize(values: number[]): SummaryStats {
  const count = values.length
  if (count === 0) {
    return { mean: null, median: null, mode: null, stdDev: null, count: 0 }
  }

  const mean = _mean(values)!
  const sorted = [...values].sort((a, b) => a - b)
  const median = _median(sorted)
  const mode = _mode(values)
  const stdDev = _stdDev(values, mean)

  return { mean, median, mode, stdDev, count }
}
