/**
 * Normalize unicode and strip HTML tags from input.
 * - Removes null bytes
 * - Strips HTML tags using a regex replacement
 * - Trims leading/trailing whitespace
 * - Normalizes unicode to NFC form
 */
export function sanitizeInput(input: string): string {
  let s = input.replace(/\0/g, '')
  s = s.replace(/<[^>]*>/g, '')
  s = s.trim()
  s = s.normalize('NFC')
  return s
}
