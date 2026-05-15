/**
 * Counts how many times a given letter appears in a string (case-sensitive).
 * @param input - The string to search
 * @param letter - The single character to count
 * @returns The number of occurrences of letter in input
 */
export function countLetters(input: string, letter: string): number {
  if (!letter) return 0
  return input.split(letter).length - 1
}
