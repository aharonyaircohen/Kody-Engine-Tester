export function toSnakeCase(str: string): string {
  if (!str) return str
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z0-9])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}
