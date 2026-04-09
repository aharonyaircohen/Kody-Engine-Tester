/**
 * Sanitize user input for safe storage and rendering.
 * - Strips HTML tags (preventing XSS)
 * - Removes null bytes
 * - Trims leading/trailing whitespace
 * - Normalizes unicode to NFC form (standard cross-platform representation)
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    // Remove null bytes (used in exploits)
    .replace(/\0/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Trim whitespace
    .trim()
    // Normalize unicode to NFC form (canonical composition)
    .normalize('NFC')
}
