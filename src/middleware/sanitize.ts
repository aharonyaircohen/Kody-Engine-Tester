/**
 * Sanitizes user input by stripping HTML tags, trimming whitespace,
 * and normalizing unicode characters.
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize unicode and strip diacritics (é → e, ñ → n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Trim whitespace
    .trim()
    // Collapse multiple whitespace into single space
    .replace(/\s+/g, ' ')
}
