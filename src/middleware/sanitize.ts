/**
 * Strips HTML tags from a string.
 */
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Normalizes unicode characters using NFC normalization.
 */
function normalizeUnicode(input: string): string {
  return input.normalize('NFC')
}

/**
 * Sanitizes user input by stripping HTML tags, trimming whitespace,
 * and normalizing unicode characters.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  return normalizeUnicode(stripHtmlTags(input).trim())
}
