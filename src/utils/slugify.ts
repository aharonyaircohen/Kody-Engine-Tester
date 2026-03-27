/**
 * Converts a string to a URL-safe slug.
 * - Unicode is normalized and accented characters are converted to ASCII equivalents (é → e).
 * - Non-alphanumeric characters (except hyphens) are removed.
 * - Multiple spaces/hyphens are collapsed into a single hyphen.
 * - Leading and trailing hyphens are stripped.
 */
export function slugify(str: string): string {
  if (!str) return ''
  return (
    str
      // Normalize unicode and strip diacritics (é → e, ñ → n, etc.)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Convert to lowercase
      .toLowerCase()
      // Replace non-alphanumeric chars (except hyphens/spaces) with hyphens
      .replace(/[^a-z0-9\s-]/g, '-')
      // Collapse multiple spaces into single hyphens
      .replace(/\s+/g, '-')
      // Collapse multiple hyphens into one
      .replace(/-+/g, '-')
      // Strip leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
  )
}
