/**
 * Base64 encoding and decoding utilities for UTF-8 strings.
 */

export function encode(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64')
}

export function decode(input: string): string {
  return Buffer.from(input, 'base64').toString('utf-8')
}

export function isValid(input: string): boolean {
  if (!input || input.length === 0) {
    return false
  }
  // Base64 strings should only contain valid characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Regex.test(input)) {
    return false
  }
  // Check length is a multiple of 4
  if (input.length % 4 !== 0) {
    return false
  }
  try {
    decode(input)
    return true
  } catch {
    return false
  }
}
