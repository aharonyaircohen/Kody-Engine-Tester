/**
 * Generates a RFC4122-compliant UUID v4 string.
 * Uses crypto.randomUUID() when available (Node.js 14.17+), otherwise
 * falls back to a manual implementation using crypto.getRandomValues().
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (8-4-4-4-12 hex digits)
 * - Version 4 bits (bits 12-15) are set to 0100
 * - Variant bits (bits 16-17) are set to 10, so y ∈ {8, 9, a, b}
 */
export function uuidv4(): string {
  // Use native implementation if available (Node.js 14.17+)
  const cryptoObj = (
    typeof globalThis.crypto !== 'undefined'
      ? globalThis.crypto
      : undefined
  ) as Crypto | undefined

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID()
  }

  // Fallback implementation using crypto.getRandomValues
  const bytes = new Uint8Array(16)
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes)
  } else {
    // Math.random fallback (not cryptographically secure, but valid format)
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Set version to 0100 (4) in bits 12-15
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  // Set variant to 10xx in bits 16-17
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}
