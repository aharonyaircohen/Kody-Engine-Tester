/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param arr - The array to shuffle
 * @param seed - Optional seed for reproducible shuffles
 * @returns A new shuffled array (does not mutate the original)
 */
export function shuffle<T>(arr: T[], seed?: number): T[] {
  const result = [...arr]

  // Seeded PRNG using mulberry32 algorithm
  let state = seed ?? Math.floor(Math.random() * 2147483647)
  const random = (): number => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
