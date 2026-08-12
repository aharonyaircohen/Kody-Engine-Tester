export function capitalizeWords(str: string): string {
  if (!str) return str
  return str
    .split(' ')
    .map(word => word.toLowerCase())
    .join(' ')
}
