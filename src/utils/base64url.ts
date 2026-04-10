/**
 * URL-safe base64 encoding and decoding utilities for UTF-8 strings.
 * Uses TextEncoder/TextDecoder for proper Unicode support.
 */

/**
 * Encodes a UTF-8 string to URL-safe base64.
 * Replaces '+' with '-', '/' with '_', and removes '=' padding.
 * @param input - The string to encode
 * @returns The URL-safe base64 encoded string (no padding)
 */
export function encode(input: string): string {
  if (!input || input.length === 0) {
    return ''
  }
  const bytes = new TextEncoder().encode(input)
  const binary = String.fromCharCode(...bytes)
  const base64 = btoa(binary)
  // Convert to URL-safe base64: replace + with -, / with _, remove padding
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decodes a URL-safe base64 string to UTF-8.
 * @param input - The URL-safe base64 string to decode
 * @returns The decoded UTF-8 string
 */
export function decode(input: string): string {
  if (!input || input.length === 0) {
    return ''
  }
  // Restore standard base64: replace - with +, _ with /
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if necessary
  const padding = base64.length % 4
  if (padding > 0) {
    base64 += '='.repeat(4 - padding)
  }
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}