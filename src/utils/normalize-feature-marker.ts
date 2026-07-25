/**
 * Converts a feature title to a normalized marker string.
 * - Leading and trailing whitespace are trimmed.
 * - Text is converted to lowercase.
 * - Whitespace runs are collapsed into single hyphens.
 * - Multiple consecutive hyphens are collapsed into one.
 * - Leading and trailing hyphens are stripped.
 */
export function normalizeFeatureMarker(str: string): string {
  if (!str) return ''
  return (
    str
      // Step 1: trim leading/trailing whitespace
      .trim()
      // Step 2: lowercase the text
      .toLowerCase()
      // Step 3: collapse any whitespace run into a single hyphen
      .replace(/\s+/g, '-')
      // Step 4: collapse multiple consecutive hyphens into one
      .replace(/-+/g, '-')
      // Step 5: strip leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
  )
}
