/**
 * Base64 encoding and decoding utilities for UTF-8 strings.
 */

/**
 * Encodes a UTF-8 string to base64.
 * @param input - The string to encode
 * @returns The base64 encoded string
 * @throws TypeError - If input is not a string
 */
export default function encode(input: string): string {
  if (!input || input.length === 0) {
    return ''
  }
  return Buffer.from(input, 'utf-8').toString('base64')
}

/**
 * Decodes a base64 string to UTF-8.
 * @param input - The base64 string to decode
 * @returns The decoded UTF-8 string
 * @throws TypeError - If input is not valid base64
 */
export function decode(input: string): string {
  if (!input || input.length === 0) {
    return ''
  }
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
  return true
}
