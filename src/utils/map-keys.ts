/**
 * Transforms the keys of an object using a mapping function.
 * Values remain unchanged.
 * @param obj - The source object
 * @param fn - A function to transform each key, receiving (value, key, index)
 * @returns A new object with transformed keys
 */
export function mapKeys<T extends object, K extends string>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T, index: number) => K
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>
  const keys = Object.keys(obj) as (keyof T)[]
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    result[fn(obj[key], key, i)] = obj[key]
  }
  return result
}
