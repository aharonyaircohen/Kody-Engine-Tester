/**
 * Sanitizes user input by stripping HTML tags, trimming whitespace,
 * and normalizing unicode characters.
 */
export function sanitizeInput(input: string): string {
  // Strip HTML tags using a regex that matches opening and closing tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Normalize unicode to NFC form
  sanitized = sanitized.normalize('NFC')

  // Convert newlines and tabs to spaces before removing control characters
  sanitized = sanitized.replace(/[\n\r\t]/g, ' ')

  // Remove dangerous control characters (except whitespace we want to preserve)
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Collapse multiple whitespace characters into a single space
  sanitized = sanitized.replace(/\s+/g, ' ')

  return sanitized
}