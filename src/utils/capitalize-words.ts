export function capitalizeWords(str: string): string {
  if (!str) return str
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}