import { sanitizeHtml } from '@/security/sanitizers'

/**
 * Sanitize a string input by stripping HTML tags, trimming whitespace,
 * and normalizing unicode.
 *
 * @param input - The raw input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''

  // Strip HTML tags and decode HTML entities
  let s = sanitizeHtml(input)

  // Trim whitespace
  s = s.trim()

  // Normalize unicode (NFC normalization for consistent representation)
  s = s.normalize('NFC')

  // Remove null bytes that may have slipped through
  s = s.replace(/\0/g, '')

  return s
}
