/**
 * Replaces named placeholders in a template string with values from an object.
 * Placeholders are in the format {key} and are replaced with the corresponding value.
 *
 * @example
 * interpolate('Hello, {name}!', { name: 'World' }) // 'Hello, World!'
 * interpolate('User {name} has {count} messages', { name: 'Alice', count: 5 }) // 'User Alice has 5 messages'
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in values ? String(values[key]) : match
  })
}