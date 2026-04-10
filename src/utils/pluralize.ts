export function pluralize(
  word: string,
  count: number,
  options?: { irregular?: Record<string, string> },
): string {
  if (count === 1) return word

  if (options?.irregular?.[word]) {
    return options.irregular[word]
  }

  return word + 's'
}