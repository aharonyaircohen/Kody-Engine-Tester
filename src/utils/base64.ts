/**
 * Base64 encoding/decoding utility with support for strings, buffers, and URL-safe encoding.
 */

/**
 * Encodes a string to base64.
 * @param input - The string to encode
 * @param urlSafe - If true, uses URL-safe base64 encoding (replaces + with - and / with _)
 */
export function encodeBase64(input: string, urlSafe = false): string {
  const encoded = Buffer.from(input, 'utf-8').toString('base64')
  if (urlSafe) {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return encoded
}

/**
 * Decodes a base64 string.
 * @param input - The base64 string to decode
 * @param urlSafe - If true, expects URL-safe base64 encoding
 */
export function decodeBase64(input: string, urlSafe = false): string {
  let encoded = input
  if (urlSafe) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padding = encoded.length % 4
    if (padding > 0) {
      encoded += '='.repeat(4 - padding)
    }
  }
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

/**
 * Encodes a buffer to base64.
 * @param input - The buffer to encode
 * @param urlSafe - If true, uses URL-safe base64 encoding
 */
export function encodeBase64Buffer(input: Buffer, urlSafe = false): string {
  const encoded = input.toString('base64')
  if (urlSafe) {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return encoded
}

/**
 * Decodes a base64 string to a buffer.
 * @param input - The base64 string to decode
 * @param urlSafe - If true, expects URL-safe base64 encoding
 */
export function decodeBase64Buffer(input: string, urlSafe = false): Buffer {
  let encoded = input
  if (urlSafe) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padding = encoded.length % 4
    if (padding > 0) {
      encoded += '='.repeat(4 - padding)
    }
  }
  return Buffer.from(encoded, 'base64')
}
