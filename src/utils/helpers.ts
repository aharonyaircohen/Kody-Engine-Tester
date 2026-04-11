/**
 * Common helper utilities
 * @module utils/helpers
 */

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * Convert a value to a string, defaulting to empty string for null/undefined
 */
export function toString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

/**
 * Convert a value to a number, defaulting to a fallback
 */
export function toNumber(value: unknown, fallback: number = 0): number {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

const helpers = {
  isDefined,
  isString,
  isNumber,
  toString,
  toNumber,
}

export default helpers