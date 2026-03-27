export function toKebabCase(str: string): string {
  if (!str) return str
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z0-9])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}
