/**
 * URL Shortener Utility
 * Generates short, URL-safe hash codes from URLs using SHA-256 and base62 encoding.
 */

import crypto from 'crypto'

// Base62 character set: a-z, A-Z, 0-9
const BASE62_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export interface UrlShortenerOptions {
  /** Length of the generated short code (default: 7, max: 32) */
  length?: number
  /** Optional salt to add additional randomness (recommended for security) */
  salt?: string
}

export interface ShortCodeResult {
  shortCode: string
  originalUrl: string
}

/**
 * Generates a deterministic short hash code from a URL.
 * Uses SHA-256 and base62 encoding for URL-safe output.
 *
 * @param url - The full URL to hash
 * @param options - Configuration options (length, salt)
 * @returns A short code result containing the short code and original URL
 *
 * @example
 * const result = generateShortCode('https://example.com/very/long/path')
 * // result.shortCode => 'aB3x9kL'
 * // result.originalUrl => 'https://example.com/very/long/path'
 *
 * @example
 * // With custom length and salt
 * const result = generateShortCode('https://example.com/page', { length: 10, salt: 'myapp' })
 */
export async function generateShortCode(
  url: string,
  options: UrlShortenerOptions = {}
): Promise<ShortCodeResult> {
  if (!url) {
    throw new Error('URL is required')
  }

  const length = Math.min(Math.max(options.length ?? 7, 1), 32)
  const salt = options.salt ?? ''

  // Combine URL with salt for hashing
  const input = salt ? `${url}:${salt}` : url

  // Hash using SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Convert to base62
  let shortCode = ''
  let index = 0
  const hashLength = hashArray.length

  while (shortCode.length < length && index < hashLength * 2) {
    // Combine current and next byte for better distribution
    const byteIndex = index % hashLength
    const nextByteIndex = (byteIndex + 1) % hashLength
    const combined = (hashArray[byteIndex] * 256 + hashArray[nextByteIndex]) % 62
    shortCode += BASE62_CHARS[combined]
    index++
  }

  return {
    shortCode: shortCode.substring(0, length),
    originalUrl: url,
  }
}

/**
 * Synchronous version of generateShortCode that uses SHA-256 hash.
 *
 * @param url - The full URL to hash
 * @param options - Configuration options (length, salt)
 * @returns A short code result containing the short code and original URL
 */
export function generateShortCodeSync(
  url: string,
  options: UrlShortenerOptions = {}
): ShortCodeResult {
  if (!url) {
    throw new Error('URL is required')
  }

  const length = Math.min(Math.max(options.length ?? 7, 1), 32)
  const salt = options.salt ?? ''

  // Combine URL with salt for hashing
  const input = salt ? `${url}:${salt}` : url

  // Hash using SHA-256 (synchronous via Node.js crypto)
  const hashBuffer = crypto.createHash('sha256').update(input).digest()
  const hashArray = Array.from(hashBuffer)

  // Convert to base62
  let shortCode = ''
  let index = 0
  const hashLength = hashArray.length

  while (shortCode.length < length && index < hashLength * 2) {
    // Combine current and next byte for better distribution
    const byteIndex = index % hashLength
    const nextByteIndex = (byteIndex + 1) % hashLength
    const combined = (hashArray[byteIndex] * 256 + hashArray[nextByteIndex]) % 62
    shortCode += BASE62_CHARS[combined]
    index++
  }

  return {
    shortCode: shortCode.substring(0, length),
    originalUrl: url,
  }
}

/**
 * Validates if a string is a valid short code format.
 *
 * @param code - The code to validate
 * @returns true if the code is valid, false otherwise
 */
export function isValidShortCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }

  // Must be 1-32 characters and only contain base62 characters
  if (code.length < 1 || code.length > 32) {
    return false
  }

  return /^[a-zA-Z0-9]+$/.test(code)
}

/**
 * Encodes a URL into a base62 short code.
 * Alias for generateShortCode for API compatibility.
 */
export const encodeUrl = generateShortCode

/**
 * Decodes a short code back to the original URL.
 * Note: This is a one-way hash - the original URL cannot be recovered.
 * This function is provided for API symmetry but will throw an error.
 *
 * @param _code - The short code (will not be decoded)
 * @throws Error indicating this is a one-way hash
 */
export function decodeUrl(_code: string): never {
  throw new Error(
    'URL shortener uses one-way hashing. Original URL cannot be recovered. ' +
    'Store the mapping between short codes and URLs in a database.'
  )
}