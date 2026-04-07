/**
 * Reverses all words in a string while maintaining their original positions.
 * Multiple spaces between words are preserved.
 */
export function reverseWords(str: string): string {
  if (!str) return ''

  return str.replace(/\S+/g, (word) => word.split('').reverse().join(''))
}