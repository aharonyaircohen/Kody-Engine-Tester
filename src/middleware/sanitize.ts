/**
 * Sanitizes user input for safe use in HTML, databases, and other contexts.
 * - Strips HTML tags
 * - Trims leading/trailing whitespace
 * - Normalizes unicode (NFD + combining diacritical mark removal)
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    // Normalize unicode and strip diacritics (é → e, ñ → n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Trim leading and trailing whitespace
    .trim()
}
